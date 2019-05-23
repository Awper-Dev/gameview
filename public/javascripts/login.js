/* global Swal $*/
$('.message a').click(function () {
    $('form').animate({
        height: 'toggle',
        opacity: 'toggle',
    }, 'slow');
});

document.querySelector('.login-form').addEventListener('submit', e => {
    e.preventDefault();
    submitLogin(e);
});


document.querySelector('.login-form').addEventListener('submit', e => {
    e.preventDefault();
    submitLogin(e);
});

document.querySelector('.register-form').addEventListener('submit', e => {
    e.preventDefault();
    submitCreate(e);
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
            toast: true,
            position: 'top-end',
            type: ((r.ok) ? 'success' : 'error'),
            text: (r.status !== 503) ? await r.text() : 'Server overloaded, please try again later',
            showConfirmButton: false,
            timer: 3000,
            background: '#2a2c2e',
        });
        if (r.ok) setTimeout(() => document.location = '/users', 1000);
    });
}

function submitCreate(e) {
    fetch('/users/register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            username: e.srcElement[0].value,
            password: e.srcElement[1].value,
            email: e.srcElement[2].value,
        }),
    }).then(async (r) => {
        Swal.fire({
            toast: true,
            position: 'top-end',
            type: ((r.ok) ? 'success' : 'error'),
            text: (r.status !== 503) ? await r.text() : 'Server overloaded, please try again later',
            showConfirmButton: false,
            timer: 3000,
            background: '#2a2c2e',
        });
        if (r.ok) setTimeout(() => document.location = '/login', 1000);
    });
}