$('.message a').click(function () {
    $('form').animate({
        height: "toggle",
        opacity: "toggle"
    }, "slow");
});

document.querySelector('.login-form').addEventListener('submit', e => {
    e.preventDefault();
    submitLogin(e);
});


function submitLogin(e) {
    fetch('/users/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            email: e.srcElement[0].value,
            password: e.srcElement[1].value,
        }),
    }).then(async (r) => {
        Swal.fire({
            position: 'top-end',
            type: ((r.ok) ? 'success' : 'error'),
            text: await r.text(),
            showConfirmButton: false,
            timer: 3000,
            background: '#2a2c2e',
        });
        if (r.ok) setTimeout(() => document.location = '/users', 1000);
    });
}