using System.Diagnostics;
using System.Text.Json;
using System.Collections.Concurrent;
using System.Text;

namespace SystemDesignRecommenderApi.Clients
{
    public class McpClient : IAsyncDisposable
    {
        private Process? _process;
        private StreamWriter? _stdin;
        private StreamReader? _stdout;
        private StreamReader? _stderr;
        private bool _initialized;
        private Task? _readerTask;
        private Task? _errorReaderTask;
        private CancellationTokenSource? _cts;
        private readonly ConcurrentQueue<string> _responseQueue = new();
        private const int InitializationTimeoutMs = 60000;
        private const int ResponseTimeoutMs = 30000;

        public async Task StartAsync()
        {
            if (_process != null)
                return;

            _cts = new CancellationTokenSource();

            _process = new Process
            {
                StartInfo = new ProcessStartInfo
                {
                    FileName = "docker",
                    Arguments = "run -i public.ecr.aws/awslabs-mcp/awslabs/aws-documentation-mcp-server:latest",
                    RedirectStandardInput = true,
                    RedirectStandardOutput = true,
                    RedirectStandardError = true,
                    UseShellExecute = false,
                    CreateNoWindow = true
                }
            };

            Console.WriteLine("[MCP] Starting Docker process...");
            _process.Start();
            Console.WriteLine("[MCP] Docker process started");

            _stdin = _process.StandardInput;
            _stdin.AutoFlush = true;
            
            _stdout = _process.StandardOutput;
            _stderr = _process.StandardError;

            // Start background reader tasks
            _readerTask = ReadOutputAsync(_cts.Token);
            _errorReaderTask = ReadErrorAsync(_cts.Token);

            await Task.Delay(500); // Give process time to start

            await InitializeAsync();
            _initialized = true;
        }

        private async Task ReadOutputAsync(CancellationToken cancellationToken)
        {
            try
            {
                if (_stdout == null)
                {
                    Console.WriteLine("[MCP] ERROR: stdout is null");
                    return;
                }

                Console.WriteLine("[MCP] Reader task started");
                StringBuilder lineBuilder = new StringBuilder();
                char[] buffer = new char[1];
                
                while (true)
                {
                    int charsRead = await _stdout.ReadAsync(buffer.AsMemory(0, 1), cancellationToken);
                    if (charsRead == 0)
                        break;

                    char c = buffer[0];
                    lineBuilder.Append(c);

                    if (c == '\n')
                    {
                        string line = lineBuilder.ToString().TrimEnd();
                        lineBuilder.Clear();

                        if (!string.IsNullOrEmpty(line))
                        {
                            _responseQueue.Enqueue(line);
                            Console.WriteLine($"[MCP] ✓ Queued response: {line[..Math.Min(80, line.Length)]}...");
                        }
                    }
                }
                
                Console.WriteLine("[MCP] Reader task ended (stream closed)");
            }
            catch (OperationCanceledException)
            {
                Console.WriteLine("[MCP] Reader task cancelled");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[MCP] ✗ Reader task error: {ex.GetType().Name}: {ex.Message}");
            }
        }

        private async Task ReadErrorAsync(CancellationToken cancellationToken)
        {
            try
            {
                if (_stderr == null)
                    return;

                Console.WriteLine("[MCP] Error reader task started");
                string? line;
                while ((line = await _stderr.ReadLineAsync(cancellationToken)) != null)
                {
                    if (!string.IsNullOrEmpty(line))
                    {
                        Console.WriteLine($"[MCP] STDERR: {line}");
                    }
                }
            }
            catch (OperationCanceledException)
            {
                Console.WriteLine("[MCP] Error reader task cancelled");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[MCP] Error reader task error: {ex.Message}");
            }
        }

        private async Task InitializeAsync()
        {
            var initRequest = new McpRequest
            {
                Id = "1",
                Method = "initialize",
                Params = new
                {
                    protocolVersion = "2024-11-05",
                    clientInfo = new
                    {
                        name = "dotnet-mcp-client",
                        version = "1.0"
                    },
                    capabilities = new { }
                }
            };

            await SendAsync(initRequest);

            var response = await ReceiveAsync(InitializationTimeoutMs);
            if (string.IsNullOrEmpty(response))
                throw new InvalidOperationException("No response from initialization");

            Console.WriteLine($"[MCP] ✓ Initialize response received: {response[..Math.Min(100, response.Length)]}...");

            var initializedNotification = new McpRequest
            {
                Method = "initialized",
                Params = new { }
            };

            await SendAsync(initializedNotification);
            
            // Give the server a moment to process the notification
            await Task.Delay(100);
        }

        private async Task SendAsync(object payload)
        {
            if (_stdin == null)
                throw new InvalidOperationException("MCP client not started");

            var json = JsonSerializer.Serialize(payload);
            Console.WriteLine($"[MCP] → Sending: {json[..Math.Min(80, json.Length)]}...");

            await _stdin.WriteLineAsync(json);
        }

        private async Task<string?> ReceiveAsync(int timeoutMs = -1)
        {
            var timeout = timeoutMs > 0 ? timeoutMs : ResponseTimeoutMs;
            var sw = System.Diagnostics.Stopwatch.StartNew();

            Console.WriteLine($"[MCP] ⏳ Waiting for response (timeout: {timeout}ms)...");

            while (sw.ElapsedMilliseconds < timeout)
            {
                if (_responseQueue.TryDequeue(out var response))
                {
                    Console.WriteLine($"[MCP] ← Received from queue: {response[..Math.Min(80, response.Length)]}...");
                    return response;
                }

                // Wait a bit before checking again
                await Task.Delay(50);
            }

            Console.WriteLine($"[MCP] ✗ TIMEOUT: No response within {timeout}ms. Queue count: {_responseQueue.Count}");
            throw new TimeoutException($"No response from MCP server within {timeout}ms. Make sure Docker is running and the MCP server container is accessible.");
        }

        public async Task<string?> ListTools()
        {
            if (!_initialized)
                await StartAsync();

            var request = new McpRequest
            {
                Id = Guid.NewGuid().ToString(),
                Method = "tools/list"
            };

            await SendAsync(request);
            return await ReceiveAsync();
        }

        public async Task<string?> SearchAwsDocs(string query)
        {
            if (!_initialized)
                await StartAsync();

            var request = new McpRequest
            {
                Id = Guid.NewGuid().ToString(),
                Method = "tools/call",
                Params = new
                {
                    name = "search_documentation",
                    arguments = new
                    {
                        search_phrase = query
                    }
                }
            };

            await SendAsync(request);
            return await ReceiveAsync();
        }

        public async ValueTask DisposeAsync()
        {
            try
            {
                _cts?.Cancel();
                
                if (_readerTask != null)
                {
                    try
                    {
                        await _readerTask;
                    }
                    catch { }
                }

                if (_errorReaderTask != null)
                {
                    try
                    {
                        await _errorReaderTask;
                    }
                    catch { }
                }
            }
            finally
            {
                _stdin?.Dispose();
                _stdout?.Dispose();
                _stderr?.Dispose();
                _process?.Dispose();
                _cts?.Dispose();
            }
        }
    }

    public class McpRequest
    {
        [System.Text.Json.Serialization.JsonPropertyName("jsonrpc")]
        public string JsonRpc { get; set; } = "2.0";

        [System.Text.Json.Serialization.JsonPropertyName("id")]
        public string? Id { get; set; }

        [System.Text.Json.Serialization.JsonPropertyName("method")]
        public required string Method { get; set; }

        [System.Text.Json.Serialization.JsonPropertyName("params")]
        public object? Params { get; set; }
    }
}