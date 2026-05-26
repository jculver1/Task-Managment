using System.Net;
using System.Net.Http.Json;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using TaskManager.Models;
using Xunit;

namespace TaskManager.Tests;

public class TasksApiFactory : WebApplicationFactory<Program>
{
    private readonly string _dbName = Guid.NewGuid().ToString();

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        base.ConfigureWebHost(builder);
        builder.ConfigureServices(services =>
        {
            var toRemove = services
                .Where(d =>
                    d.ServiceType == typeof(AppDbContext) ||
                    d.ServiceType == typeof(DbContextOptions<AppDbContext>) ||
                    (d.ServiceType.IsGenericType &&
                     d.ServiceType.GetGenericArguments().Any(t => t == typeof(AppDbContext))))
                .ToList();

            foreach (var d in toRemove)
                services.Remove(d);

            services.AddDbContext<AppDbContext>(options =>
                options.UseInMemoryDatabase(_dbName));
        });
    }
}

public class TasksEndpointsTests
{
    private static HttpClient CreateClient() => new TasksApiFactory().CreateClient();

    [Fact]
    public async Task GetTasks_ReturnsEmptyList_WhenNoTasksExist()
    {
        var client = CreateClient();

        var response = await client.GetAsync("/tasks");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var tasks = await response.Content.ReadFromJsonAsync<List<TaskItem>>();
        Assert.Empty(tasks);
    }

    [Fact]
    public async Task PostTask_ReturnsCreatedTaskWith201()
    {
        var client = CreateClient();

        var response = await client.PostAsJsonAsync("/tasks",
            new { title = "Test Task", description = "A test", isComplete = false });

        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
        var created = await response.Content.ReadFromJsonAsync<TaskItem>();
        Assert.NotNull(created);
        Assert.True(created.Id > 0);
        Assert.Equal("Test Task", created.Title);
        Assert.Equal("A test", created.Description);
        Assert.False(created.IsComplete);
    }

    [Fact]
    public async Task GetTasks_ReturnsTaskAfterCreation()
    {
        var client = CreateClient();
        await client.PostAsJsonAsync("/tasks",
            new { title = "My Task", description = "Desc", isComplete = false });

        var response = await client.GetAsync("/tasks");
        var tasks = await response.Content.ReadFromJsonAsync<List<TaskItem>>();

        Assert.Single(tasks);
        Assert.Equal("My Task", tasks![0].Title);
    }

    [Fact]
    public async Task PutTask_UpdatesAndReturnsTask()
    {
        var client = CreateClient();
        var created = await (await client.PostAsJsonAsync("/tasks",
            new { title = "Old Title", description = "Old desc", isComplete = false }))
            .Content.ReadFromJsonAsync<TaskItem>();

        var response = await client.PutAsJsonAsync($"/tasks/{created!.Id}",
            new { title = "New Title", description = "New desc", isComplete = true });

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var updated = await response.Content.ReadFromJsonAsync<TaskItem>();
        Assert.Equal("New Title", updated!.Title);
        Assert.Equal("New desc", updated.Description);
        Assert.True(updated.IsComplete);
    }

    [Fact]
    public async Task PutTask_Returns404_WhenTaskDoesNotExist()
    {
        var client = CreateClient();

        var response = await client.PutAsJsonAsync("/tasks/999",
            new { title = "X", description = "X", isComplete = false });

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task DeleteTask_RemovesTaskAndReturns204()
    {
        var client = CreateClient();
        var created = await (await client.PostAsJsonAsync("/tasks",
            new { title = "To Delete", description = "", isComplete = false }))
            .Content.ReadFromJsonAsync<TaskItem>();

        var deleteResponse = await client.DeleteAsync($"/tasks/{created!.Id}");
        Assert.Equal(HttpStatusCode.NoContent, deleteResponse.StatusCode);

        var tasks = await (await client.GetAsync("/tasks"))
            .Content.ReadFromJsonAsync<List<TaskItem>>();
        Assert.Empty(tasks);
    }

    [Fact]
    public async Task DeleteTask_Returns404_WhenTaskDoesNotExist()
    {
        var client = CreateClient();

        var response = await client.DeleteAsync("/tasks/999");

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task GetTasks_FiltersByCompleteStatus()
    {
        var client = CreateClient();
        await client.PostAsJsonAsync("/tasks", new { title = "Done", description = "", isComplete = true });
        await client.PostAsJsonAsync("/tasks", new { title = "Pending", description = "", isComplete = false });

        var completed = await (await client.GetAsync("/tasks?complete=true"))
            .Content.ReadFromJsonAsync<List<TaskItem>>();
        Assert.Single(completed);
        Assert.Equal("Done", completed![0].Title);

        var pending = await (await client.GetAsync("/tasks?complete=false"))
            .Content.ReadFromJsonAsync<List<TaskItem>>();
        Assert.Single(pending);
        Assert.Equal("Pending", pending![0].Title);
    }
}
