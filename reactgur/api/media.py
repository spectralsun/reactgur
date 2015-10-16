import os

import magic
import bleach
from flask import Blueprint, request, current_app
from flask.ext.login import current_user

from reactgur.models import Media
from reactgur.util import jsonify, generate_filename, convert_to_jpeg, \
    get_image_size, image_extensions, generate_thumbnail


media_api = Blueprint('media_api', __name__)

@media_api.route('/api/v1/media', methods=['POST'])
def post_media():
    if current_app.config['UPLOAD_REQUIRES_LOGIN'] \
       and not current_user.is_authenticated:
       return jsonify(error=['Login required.'], _status=400)
    if not request.files or 'file' not in request.files:
        return jsonify(error=['Invalid request.'], _status=400)

    magic_mime = magic.Magic(mime=True)
    thumbnail_size = current_app.config['THUMBNAIL_SIZE']
    upload_path = current_app.config['UPLOAD_PATH']
    upload = request.files['file']

    # Check MIME
    mime = magic_mime.from_buffer(upload.stream.read(1024))
    if mime not in current_app.config['IMAGE_ACCEPT_MIMES']:
        return jsonify(error=['Invalid image type.'], _status=400)
        
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
    if current_user.is_authenticated():
        media.user = current_user
        thumbnail.user = current_user
    media.save()
    return jsonify(media)

@media_api.route('/api/v1/media', methods=['GET'])
def get_media():
    last = Media.get_by_filename(request.args['after'][1:])
    return jsonify(Media.get_latest_after(last))

@media_api.route('/api/v1/media', methods=['DELETE'])
def delete_media():
    media = Media.get_by_filename(request.json['id'][1:])
    if not media:
        return jsonify(['Invalid media ID.'], _status_code=400)
    if not current_user.is_authenticated() or \
       (not media.is_owner(current_user) and not current_user.is_admin):
       return jsonify(['Invalid access.'], _status_code=400)
    media.delete()
    return ''

@media_api.route('/api/v1/media', methods=['PUT'])
def put_media():
    pass