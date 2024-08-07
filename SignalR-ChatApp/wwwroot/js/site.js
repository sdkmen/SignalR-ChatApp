$(document).ready(function () {
	$('#btn-login').click(function () {
		var username = $('#username').val();
		if (username) {
			localStorage.setItem('username', username);
			window.location.href = '/chat';
		} else {
			alert('Please enter a username');
		}
	});
});