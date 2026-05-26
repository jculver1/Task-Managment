using Microsoft.EntityFrameworkCore;
using TaskManager.Endpoints;
using TaskManager.Models;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseInMemoryDatabase("Tasks")
);

var app = builder.Build();
app.MapControllers();
app.MapTasksEndpoints();
app.Run();

public partial class Program { }
