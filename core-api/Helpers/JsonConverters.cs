using System.Text.Json;
using System.Text.Json.Serialization;
using System.Text.RegularExpressions;
using SystemDesignRecommenderApi.Domain.Models;

namespace SystemDesignRecommenderApi.Helpers;

public class FlexibleIntConverter : JsonConverter<int>
{
    public override int Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
    {
        if (reader.TokenType == JsonTokenType.Number)
        {
            return reader.GetInt32();
        }

        if (reader.TokenType == JsonTokenType.String)
        {
            string? value = reader.GetString();
            if (string.IsNullOrWhiteSpace(value)) return 0;

            // Strip separators like underscores and commas
            value = value.Replace("_", "").Replace(",", "");

            // Extract the first sequence of digits found in the string
            var match = Regex.Match(value, @"\d+");
            if (match.Success && int.TryParse(match.Value, out int result))
            {
                return result;
            }
        }

        return 0; // Fallback
    }

    public override void Write(Utf8JsonWriter writer, int value, JsonSerializerOptions options)
    {
        writer.WriteNumberValue(value);
    }
}

public class FlexibleNullableIntConverter : JsonConverter<int?>
{
    public override int? Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
    {
        if (reader.TokenType == JsonTokenType.Null) return null;

        if (reader.TokenType == JsonTokenType.Number)
        {
            return reader.GetInt32();
        }

        if (reader.TokenType == JsonTokenType.String)
        {
            string? value = reader.GetString();
            if (string.IsNullOrWhiteSpace(value)) return null;

            // Strip separators like underscores and commas
            value = value.Replace("_", "").Replace(",", "");

            var match = Regex.Match(value, @"\d+");
            if (match.Success && int.TryParse(match.Value, out int result))
            {
                return result;
            }
        }

        return null;
    }

    public override void Write(Utf8JsonWriter writer, int? value, JsonSerializerOptions options)
    {
        if (value.HasValue) writer.WriteNumberValue(value.Value);
        else writer.WriteNullValue();
    }
}

public class FlexibleDoubleConverter : JsonConverter<double>
{
    public override double Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
    {
        if (reader.TokenType == JsonTokenType.Number) return reader.GetDouble();
        if (reader.TokenType == JsonTokenType.String)
        {
            string? value = reader.GetString();
            if (string.IsNullOrWhiteSpace(value)) return 0;
            value = value.Replace("_", "").Replace(",", "");
            var match = Regex.Match(value, @"[\d.]+");
            if (match.Success && double.TryParse(match.Value, out double result)) return result;
        }
        return 0;
    }

    public override void Write(Utf8JsonWriter writer, double value, JsonSerializerOptions options)
    {
        writer.WriteNumberValue(value);
    }
}

public class FlexibleNullableDoubleConverter : JsonConverter<double?>
{
    public override double? Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
    {
        if (reader.TokenType == JsonTokenType.Null) return null;
        if (reader.TokenType == JsonTokenType.Number) return reader.GetDouble();
        if (reader.TokenType == JsonTokenType.String)
        {
            string? value = reader.GetString();
            if (string.IsNullOrWhiteSpace(value)) return null;
            value = value.Replace("_", "").Replace(",", "");
            var match = Regex.Match(value, @"[\d.]+");
            if (match.Success && double.TryParse(match.Value, out double result)) return result;
        }
        return null;
    }

    public override void Write(Utf8JsonWriter writer, double? value, JsonSerializerOptions options)
    {
        if (value.HasValue) writer.WriteNumberValue(value.Value);
        else writer.WriteNullValue();
    }
}

public class FlexibleStringConverter : JsonConverter<string>
{
    public override string Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
    {
        if (reader.TokenType == JsonTokenType.String) return reader.GetString() ?? "";
        if (reader.TokenType == JsonTokenType.Number) return reader.GetDouble().ToString();
        if (reader.TokenType == JsonTokenType.True) return "true";
        if (reader.TokenType == JsonTokenType.False) return "false";
        if (reader.TokenType == JsonTokenType.Null) return "";

        // If it's an object or array, read the whole thing as a raw string
        using (var jsonDoc = JsonDocument.ParseValue(ref reader))
        {
            return jsonDoc.RootElement.GetRawText();
        }
    }

    public override void Write(Utf8JsonWriter writer, string value, JsonSerializerOptions options)
    {
        writer.WriteStringValue(value);
    }
}

public class FlexibleArchComponentConverter : JsonConverter<ArchComponent>
{
    public override ArchComponent Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
    {
        if (reader.TokenType == JsonTokenType.StartObject)
        {
            // Use default deserialization
            using (var jsonDoc = JsonDocument.ParseValue(ref reader))
            {
                var root = jsonDoc.RootElement;
                var component = new ArchComponent();

                if (root.TryGetProperty("choice", out var choiceProp)) component.Choice = choiceProp.GetString() ?? "";
                else if (root.TryGetProperty("Choice", out var choicePropPascal)) component.Choice = choicePropPascal.GetString() ?? "";

                if (root.TryGetProperty("justification", out var justProp)) component.Justification = justProp.GetString() ?? "";
                else if (root.TryGetProperty("Justification", out var justPropPascal)) component.Justification = justPropPascal.GetString() ?? "";

                // Fallback for other potential field names
                if (string.IsNullOrEmpty(component.Choice) && root.TryGetProperty("selection", out var selProp)) component.Choice = selProp.GetString() ?? "";
                if (string.IsNullOrEmpty(component.Justification) && root.TryGetProperty("reason", out var reasonProp)) component.Justification = reasonProp.GetString() ?? "";

                return component;
            }
        }

        if (reader.TokenType == JsonTokenType.String)
        {
            var text = reader.GetString() ?? "";
            // If it's a short string, it's likely the technology name
            if (text.Length < 100)
            {
                return new ArchComponent { Choice = text, Justification = "Selected based on architectural requirements and context." };
            }
            // If it's a long string, use the first few words as the choice and the rest as justification
            var firstSentence = text.Split('.')[0];
            var choiceLabel = firstSentence.Length > 50 ? firstSentence.Substring(0, 47) + "..." : firstSentence;
            return new ArchComponent { Choice = choiceLabel, Justification = text };
        }

        if (reader.TokenType == JsonTokenType.Null) return new ArchComponent();

        // For other types, serialize to string and put in justification
        using (var jsonDoc = JsonDocument.ParseValue(ref reader))
        {
            return new ArchComponent { Choice = "Technology Choice", Justification = jsonDoc.RootElement.GetRawText() };
        }
    }

    public override void Write(Utf8JsonWriter writer, ArchComponent value, JsonSerializerOptions options)
    {
        JsonSerializer.Serialize(writer, (object)value, options);
    }
}
