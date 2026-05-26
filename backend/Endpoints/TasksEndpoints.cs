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

        group.MapPost("/", async (TaskItem task, AppDbContext db) =>
        {
            task.CreatedAt = DateTime.UtcNow;
            db.Tasks.Add(task);
            await db.SaveChangesAsync();

            return Results.Created($"/tasks/{task.Id}", task);
        })
        .WithSummary("Create a new task");

    group.MapPut("/{id}", async (int id, TaskItem updatedTask, AppDbContext db) =>
        {
            var task = await db.Tasks.FindAsync(id);
            if (task == null)
                return Results.NotFound();

            task.Title = updatedTask.Title;
            task.Description = updatedTask.Description;
            task.IsComplete = updatedTask.IsComplete;

            await db.SaveChangesAsync();
            return Results.Ok(task);
        })
        .WithSummary("Update an existing task");

        group.MapDelete("/{id}", async (int id, AppDbContext db) =>
        {
            var task = await db.Tasks.FindAsync(id);
            if (task == null)
                return Results.NotFound();

            db.Tasks.Remove(task);
            await db.SaveChangesAsync();
            return Results.NoContent();
        })
        .WithSummary("Delete a task");
    }
}
