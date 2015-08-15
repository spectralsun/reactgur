;(function() {
    $('#modal_upload_input').fileupload({
        url: '/upload',
        dataType: 'json',
        done: function(e, data) {

        },
        progressall: function(e, data) {

        }
    });
    $(document).delegate('*[data-toggle="lightbox"]', 'click', function(event) {
        event.preventDefault();
        $(this).ekkoLightbox();
    });
})();