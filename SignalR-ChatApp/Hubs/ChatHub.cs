using Microsoft.AspNetCore.SignalR;
using System.Collections.Concurrent;
using System.Threading.Tasks;

namespace SignalR_ChatApp.Hubs
{
    public class ChatHub : Hub
    {
        private static ConcurrentDictionary<string, string> OnlineUsers = new ConcurrentDictionary<string, string>();

        public override Task OnConnectedAsync()
        {
            var username = Context.GetHttpContext().Request.Query["username"].ToString();
            if (!string.IsNullOrEmpty(username))
            {
                OnlineUsers[Context.ConnectionId] = username;
                Clients.All.SendAsync("UserConnected", username);
                Clients.Caller.SendAsync("OnlineUsers", OnlineUsers.Values);
            }

            return base.OnConnectedAsync();
        }

        public override Task OnDisconnectedAsync(Exception exception)
        {
            if (OnlineUsers.TryRemove(Context.ConnectionId, out string username))
            {
                Clients.All.SendAsync("UserDisconnected", username);
            }

            return base.OnDisconnectedAsync(exception);
        }

        public async Task SendMessage(string user, string message, string date)
        {
            await Clients.All.SendAsync("ReceiveMessage", user, message, date);
        }
    }
}
