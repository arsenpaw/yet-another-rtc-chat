namespace CompanyName.MyMeetings.API.Configuration;

public class ApplicationSettings
{
    public required CorsSettings Cors { get; set; }
}

public class CorsSettings
{
    public required string[] AllowedOrigins { get; set; }
}