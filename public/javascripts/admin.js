/* global Swal*/
setTimeout(() =>
    Swal.fire({
        title: 'Update available, restart?',
        text: updateData,
        showCancelButton: true,
        confirmButtonText: 'update and restart',
        showLoaderOnConfirm: true,
        preConfirm: () => {
            return fetch('/update')
                .then(async response => {
                    if (!response.ok) throw new Error(await response.text());
                    return response.text();
                })
                .catch(error =>
                    Swal.showValidationMessage(`Failed: ${error}`));
        },
        allowOutsideClick: () => !Swal.isLoading(),
    }).then((result) => {
        if (result.value) {
            Swal.fire({
                title: 'Updating Server',
                type: 'success',
            });
            setTimeout(() => location.reload(), 5000);
        }
    }), 5000);