#nullable enable

using CompanyName.MyMeetings.BuildingBlocks.Domain;
using Hellang.Middleware.ProblemDetails;
using Microsoft.AspNetCore.Http;

namespace CompanyName.MyMeetings.API.Configuration.Extensions;

internal static class ExceptionHandlingExtensions
{
    internal static IServiceCollection AddExceptionHandling(this IServiceCollection services)
    {
        services.AddProblemDetails(options =>
        {
            options.Map<BusinessRuleValidationException>(ex => new StatusCodeProblemDetails(StatusCodes.Status422UnprocessableEntity)
            {
                Detail = ex.Details
            });
        });

        return services;
    }
}
