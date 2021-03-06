"""registration request ip

Revision ID: 76da248141
Revises: 981c464977d
Create Date: 2015-09-02 15:16:05.929256

"""

# revision identifiers, used by Alembic.
revision = '76da248141'
down_revision = '981c464977d'
branch_labels = None
depends_on = None

from alembic import op
import sqlalchemy as sa


def upgrade():
    ### commands auto generated by Alembic - please adjust! ###
    op.add_column('user_registration_request', sa.Column('ip_address', sa.String(length=255), nullable=True))
    ### end Alembic commands ###


def downgrade():
    ### commands auto generated by Alembic - please adjust! ###
    op.drop_column('user_registration_request', 'ip_address')
    ### end Alembic commands ###
