$(document).ready(function () {
    if (!localStorage.getItem('username')) {
        window.location.href = '/Home/Login';
    }

    const username = localStorage.getItem('username');

    const connection = new signalR.HubConnectionBuilder()
        .withUrl(`/chat-hub?username=${encodeURIComponent(username)}`)
        .configureLogging(signalR.LogLevel.Information)
        .build();

    async function start() {
        try {
            await connection.start();
            console.log("SignalR connected");
        } catch (err) {
            console.error(err);
            setTimeout(start, 5000);
        }
    }

    connection.onclose(async () => {
        await start();
    });

    start();

    connection.on("ReceiveMessage", (user, message, date) => {
        user = escapeHtml(user);
        message = escapeHtml(message);

        const isCurrentUser = (user === username);
        const messageClass = isCurrentUser ? "other-message float-right" : "my-message";
        const messageDataClass = isCurrentUser ? "message-data text-right" : "message-data";

        $("#message-list").append(
            `<li class="clearfix">
            <div class="${messageDataClass}">
                <span style="font-weight:bold; padding-left: 6px;">${user}</span><br><span class="message-data-time">${date}</span>
            </div>
            <div class="message ${messageClass}">${message}</div>
        </li>`
        );

        $("#message-list2").scrollTop($("#message-list2")[0].scrollHeight);
    });

    connection.on("UserConnected", (user) => {
        if ($("#user-list").find(`#${user}`).length === 0) {
            $("#user-list").append(
                `<li class="clearfix" id="${user}">
                            <div class="about">
                                <div class="name">${user}</div>
                                <div class="status"> <i class="fa fa-circle online"></i> online </div>
                            </div>
                        </li>`
            );
        }
    });

    connection.on("UserDisconnected", (user) => {
        $(`#user-list li:contains(${user})`).remove();
    });

    connection.on("OnlineUsers", (users) => {
        $("#user-list").empty();
        users.forEach((user) => {
            $("#user-list").append(
                `<li class="clearfix" id="${user}">
                            <div class="about">
                                <div class="name">${user}</div>
                                <div class="status"> <i class="fa fa-circle online"></i> online </div>
                            </div>
                        </li>`
            );
        });
    });

    $("#btn-send-message").click(function () {
        sendMessage();
    });

    $("#message").keydown(function (e) {
        if (e.key === "Enter") {
            sendMessage();
        }
    });

    function sendMessage() {
        try {
            var message = $("#message").val();
            if (message.trim() !== "") {
                var formattedDateTime = getFormattedDateTime();
                connection.invoke("SendMessage", username, message, formattedDateTime);
                $("#message").val("");

                // Mesaj listesinin en altına kaydırma
                var messageList = $("#message-list2");
                messageList.scrollTop(messageList.prop("scrollHeight"));
            } else {
                alert("Please enter a message.");
            }
        } catch (err) {
            console.error(err);
        }
    }

    function escapeHtml(text) {
        return text.replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    function getFormattedDateTime() {
        var currentDateTime = new Date();
        var hours = currentDateTime.getHours();
        var minutes = currentDateTime.getMinutes();
        var ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12;
        hours = hours ? hours : 12; // 0'ı 12 olarak değiştir
        minutes = minutes < 10 ? '0' + minutes : minutes;
        var strTime = hours + ':' + minutes + ' ' + ampm;

        var day = currentDateTime.getDate();
        var month = currentDateTime.toLocaleString('default', { month: 'long' });

        return strTime + ', ' + day + ' ' + month;
    }
});