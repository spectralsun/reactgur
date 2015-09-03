"""media and register ip address

Revision ID: 305ace38cf61
Revises: 76da248141
Create Date: 2015-09-02 22:21:34.734292

"""

# revision identifiers, used by Alembic.
revision = '305ace38cf61'
down_revision = '76da248141'
branch_labels = None
depends_on = None

from alembic import op
import sqlalchemy as sa


def upgrade():
    ### commands auto generated by Alembic - please adjust! ###
    op.add_column('media', sa.Column('upload_ip_address', sa.String(length=64), nullable=True))
    op.add_column('user', sa.Column('register_ip_address', sa.String(length=64), nullable=True))
    ### end Alembic commands ###


def downgrade():
    ### commands auto generated by Alembic - please adjust! ###
    op.drop_column('user', 'register_ip_address')
    op.drop_column('media', 'upload_ip_address')
    ### end Alembic commands ###
