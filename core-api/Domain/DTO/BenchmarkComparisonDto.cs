namespace SystemDesignRecommenderApi.Domain.DTO;

public class BenchmarkComparisonDto
{
    public string SessionId { get; set; } = string.Empty;
    public string MatchedBlueprintTitle { get; set; } = string.Empty;
    public int MatchedBlueprintScenarioId { get; set; }
    
    public List<NodeComparisonItem> NodeComparisons { get; set; } = new();
    
    public double AccuracyScore { get; set; }
    public double PrecisionScore { get; set; }
    public double SemanticSimilarity { get; set; }
    
    public Dictionary<string, int> AiScores { get; set; } = new();
    public Dictionary<string, int> BaselineScores { get; set; } = new();
}

public class NodeComparisonItem
{
    public string NodeKey { get; set; } = string.Empty;
    public string AiChoice { get; set; } = string.Empty;
    public string BaselineChoice { get; set; } = string.Empty;
    public bool IsExactMatch { get; set; }
    public bool IsAcceptableAlternative { get; set; }
    public string Verdict { get; set; } = string.Empty;
}
