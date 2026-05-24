namespace CompanyName.MyMeetings.API.Configuration;

public class ApplicationSettings
{
    public required CorsSettings Cors { get; set; }

    public required Auth0Settings Auth0 { get; set; }
}

public class CorsSettings
{
    public required string[] AllowedOrigins { get; set; }
}

public class Auth0Settings
{
    public required string Domain { get; set; }

    public required string Audience { get; set; }
}
