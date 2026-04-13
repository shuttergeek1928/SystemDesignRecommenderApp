Technology: Nginx
Category: api_gateway

When to use:
* manage access permissions for newly created files and directories
* temporary files are stored in a shared memory zone
* Configures TCP keepalive behavior
* Limits the speed of reading the response from the proxied server
* The default parameter can simplify configurations when proxying requests to a primary server’s name and port that are different from 80.
* When caching responses for GET/HEAD requests
* Specifies trusted CA certificates for verifying the certificate of the proxied HTTPS server
* Enables byte-range support for both cached and uncached responses
* Specifies a file with revoked certificates (CRL) in the PEM format used to verify
* When HTTP/1.1 chunked transfer encoding is used to send original request body
* Server Name Indication extension (SNI) to establish a connection with the proxied HTTPS server
* When location is specified using a regular expression
* revalidation using conditional requests
* Inside named locations where the part of URI to be replaced cannot be determined
* When there's not enough free space on file system with cache
* cookies with HttpOnly flag
* Disables processing of certain header fields from proxied server
* When you need to turn ON SO_KEEPALIVE socket option for better connection management.
* Enables faster response delivery by reading and caching parts of the server's response
* Determines whether NTLM authentication should close the connection when client closes without waiting for response
* passing requests to another server
* When using named servers
* When you want to pass a URI as is
* will be cached
* When using variables in replacement strings for redirect, as it allows dynamic redirection based on request parameters.
* create local copies of static unchangeable files
* minimizing server access during data update
* Caching responses with different values
* Sets protocol and address of a proxied server
* Specifies in which cases a request should be passed to the next server
* buffering of responses from proxied server
* To minimize the number of accesses to proxied servers when populating a new cache element
* Allows handling large or streaming data without consuming all memory
* conditions under which access to a proxied server is allowed or denied
* When only caching time is specified
* Limits time during which a request can be passed to the next server
* WebSocket proxying
* Proxy requests for specific URIs
* secure cookies

When not to use:
None specified.

Tradeoffs:

Advantages:
* Sets different caching times for responses with specific codes (200, 302) and others (404)
* enables transparent proxy binding, allowing connection originate from non-local IP addresses like client's real IP address when necessary and required conditions are met
* Using regular expressions for matching in proxy_redirect directives provides flexibility and precision.
* Allows nginx to handle responses with codes >= 300 by intercepting and redirecting them internally, reducing the need for client-side redirection logic
* Efficient processing of response header fields by ignoring specified ones.
* Sets additional header fields that will not be passed
* Ability to specify secure, httponly and samesite flags for the cookie
* Cached data that not accessed during the time specified by the 'inactive' parameter get removed from cache regardless of their freshness.
* The ability to buffer the client's request body when needed can be beneficial especially if there is a need to modify or process the data before forwarding.
* Determines whether the connection with a proxied server should be closed when a client closes the connection without waiting for a response
* Enables the use of a file with SSL certificates and secret keys, which can be loaded using variables.
* Allows passing otherwise disabled header fields from the proxied server to the client.
* reduces the number of accesses to proxied servers when updating cached data
* Enables or disables buffering of a response which can improve performance
* allows starting background subrequest to update an expired cache item, while a stale cached response is returned to the client.
* Enables disabling or enabling caching based on presence/absence of certain header fields
* Enables or disables SSL session reuse based on errors like 'digest check failed' appearing in logs
* Allows setting arbitrary OpenSSL configuration commands when establishing a connection to an HTTPS server.
* Responses are cached
* Reduced load on upstream servers by caching responses locally
* The data is removed in iterations, which allows for more controlled and efficient management of the cached items.
* allows embedding variables to compose headers using proxy_set_header directive
* Allows setting modification time according to received Last-Modified response header field
* Ability to rewrite request paths and variables before forwarding the request
* Allows setting of absolute cache expiration in seconds using the @ prefix
* Improved performance for certain types of requests due to partial buffering
* Reduces load on proxied server by avoiding repeated processing of identical requests.
* allows outgoing connections from the specified local IP address with an optional port

Limitations:
* Responses with ‘Vary’ value as “*” won't be cached (1.7.7)
* Not suitable when the response changes frequently.
* maximum size of a temporary file is limited by the proxy_max_temp_file_size directive
* Cannot cache responses that do not include the specified caching parameters in their headers
* Potential delay in response delivery if the entire server's response does not fit into memory and needs to be saved as a temporary file
* Limits speed of reading from proxied server potentially causing delays if not configured properly
* Passing a request to the next server is limited by number of tries or time.
* Before version 1.1.12, proxy_pass without a URI might pass original request instead of changed one in some cases
* The directive only appeared in version 1.7.8 or later, so it might not work with older versions of Nginx and the ngx_http_proxy_module.
* If 'Set-Cookie' field is present, response will not be cached
* requires superuser privileges on Linux to run nginx worker processes for transparency in bind operation.
* The proxy_ignore_headers directive can only disable the processing, not remove it.
* The directive for purge requests might not be suitable in situations where the data is frequently accessed and doesn’t need caching.
* default size limitation by two buffers set by the proxy_buffer_size and proxy_buffers directives
* If at least one value of string parameters in proxy_cache_bypass directive is not empty and not equal to '0', response will not be saved.
* Starting from version 0.8.9, temporary files and the cache can be put on different file systems.
* The first matching directive will be chosen if several apply. This might lead to unexpected behavior.
* When buffering of responses from the proxied server is enabled and the whole response does not fit into the buffers set by proxy_buffer_size and proxy_buffers directives, a part of the response can be saved to a temporary file. This directive sets the maximum size of the temporary file.
* Requires careful configuration to prevent cache stampede problems where a sudden surge in popularity for certain content could overwhelm both client and server due to simultaneous access attempts by multiple clients trying to retrieve cached data.
* Buffering the request body when HTTP/1.1 chunked transfer encoding is used can cause issues if nginx has already started sending the request before receiving all data from the client.
* It requires proper SSL certificates and secret keys for authentication purposes which need to be managed securely.
* The limitation works only if buffering of responses from the proxied server is enabled.
* One megabyte zone can store about 8 thousand keys.
* Regular expressions are case-sensitive unless starting with '~*' for a case-insensitive match.
* If nginx simultaneously opens two connections to the proxied server, the overall rate will be twice as much as the specified limit.
* When using rewrite directive inside location and this configuration will be used to process the request
* If at least one value of string parameters (e.g., max_size or min_free) set by users isn't empty nor equal to '0', it can lead to unnecessary cache purges.
* Starting from version 0.8.9, temporary files and the persistent store can be put on different file systems which results in a costly copying operation across two file systems instead of cheap renaming
* Limited flexibility in handling dynamic content
* When using variables with redirect, it may lead to unexpected results due to variable expansion. It's important to carefully manage these expansions.
* necessitates configuring kernel routing table to intercept network traffic from the proxied server.
* This feature is limited to nginx version 1.7.7 and later versions as mentioned in the documentation context provided for Nginx Module ngx_http_proxy_module.
* In this case a file is copied across two file systems instead of cheap renaming operation
* The rate is specified in bytes per second. The zero value disables rate limiting.
* Specifies in which cases a request should be passed to the next server: One should bear in mind that passing a request to the next server is only possible if nothing has been sent to a client yet.
* Several proxy_cookie_flags directives can be specified on the same level
