using Microsoft.EntityFrameworkCore;
using TaskManager.Models;

namespace TaskManager.Endpoints;

public static class TasksEndpoints
{
    public static void MapTasksEndpoints(this WebApplication app)
    {
        var group = app.MapGroup("/tasks")
                       .WithTags("Tasks");

        group.MapGet("/", async (bool? complete, AppDbContext db) =>
        {
            var query = db.Tasks.AsQueryable();

            if (complete.HasValue)
                query = query.Where(t => t.IsComplete == complete.Value);

            var items = await query
                .OrderBy(t => t.CreatedAt)
                .ToListAsync();

            return Results.Ok(items);
        })
        .WithSummary("List all tasks");
    }
}
