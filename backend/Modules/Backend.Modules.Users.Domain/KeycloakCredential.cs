namespace Backend.Modules.Users.Domain;

public class KeycloakCredential
{
    public string Type { get; set; } = "password";

    public required string Value { get; set; }

    public bool Temporary { get; set; } = false;
}