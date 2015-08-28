import os

import magic
import bleach
from flask import Blueprint, request, current_app

from reactgur.models import Media
from reactgur.util import jsonify, generate_filename, convert_to_jpeg, \
    get_image_size, image_extensions, generate_thumbnail


media_bp = Blueprint('media', __name__)

@media_bp.route('/upload', methods=['POST'])
def upload():
    if not request.files:
        return []
    uploaded = []
    magic_mime = magic.Magic(mime=True)
    thumbnail_size = current_app.config['THUMBNAIL_SIZE']
    upload_path = current_app.config['UPLOAD_PATH']
    for key, upload in request.files.iteritems():
        
        # Check MIME
        mime = magic_mime.from_buffer(upload.stream.read(1024))
        if mime not in current_app.config['IMAGE_ACCEPT_MIMES']:
            continue
        # Rewind file stream
        upload.stream.seek(0)

        # Get original filename
        if '.' not in upload.filename:
            name = upload.filename
        else:
            name, upload.ext = upload.filename.rsplit('.', 1)
        name = bleach.clean(name);

        # Save the image to a secure random filename
        filename = generate_filename(upload_path, image_extensions[mime])
        file_path = os.path.join(upload_path, filename)
        print file_path
        upload.save(file_path)
       
        # Convert image to jpeg if bmp
        if mime == 'image/x-ms-bmp':
            filename = convert_to_jpeg(upload_path, file_path)
            os.remove(filepath)
            file_path = upload_path + filenmae

        # Get image size
        size = get_image_size(file_path)

        # Create thumbnail
        thumbname = generate_thumbnail(file_path, upload_path, thumbnail_size)
        thumbnail = Media(filename=thumbname,
                          width=thumbnail_size[0],
                          height=thumbnail_size[1])

        # Save the media instance 
        media = Media(filename=filename, 
                      name=name, 
                      width=size[0], 
                      height=size[1],
                      thumbnail=thumbnail)
        media.save()
        uploaded.append(media)
    print uploaded
    return jsonify(uploaded)
