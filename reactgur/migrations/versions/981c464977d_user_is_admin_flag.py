"""user is_admin flag

Revision ID: 981c464977d
Revises: 4684e5c6151a
Create Date: 2015-09-01 00:46:00.006668

"""

# revision identifiers, used by Alembic.
revision = '981c464977d'
down_revision = '4684e5c6151a'
branch_labels = None
depends_on = None

from alembic import op
import sqlalchemy as sa


def upgrade():
    ### commands auto generated by Alembic - please adjust! ###
    op.add_column('user', sa.Column('is_admin', sa.Boolean(), nullable=True))
    ### end Alembic commands ###


def downgrade():
    ### commands auto generated by Alembic - please adjust! ###
    op.drop_column('user', 'is_admin')
    ### end Alembic commands ###
