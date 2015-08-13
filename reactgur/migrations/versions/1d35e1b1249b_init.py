"""init

Revision ID: 1d35e1b1249b
Revises: 
Create Date: 2015-08-14 11:51:34.872155

"""

# revision identifiers, used by Alembic.
revision = '1d35e1b1249b'
down_revision = None
branch_labels = None
depends_on = None

from alembic import op
import sqlalchemy as sa


def upgrade():
    ### commands auto generated by Alembic - please adjust! ###
    op.create_table('media',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('filename', sa.String(length=255), nullable=True),
    sa.Column('name', sa.String(length=255), nullable=True),
    sa.Column('width', sa.Integer(), nullable=True),
    sa.Column('height', sa.Integer(), nullable=True),
    sa.Column('created_at', sa.DateTime(), nullable=True),
    sa.Column('thumbnail_id', sa.Integer(), nullable=True),
    sa.ForeignKeyConstraint(['thumbnail_id'], ['media.id'], ),
    sa.PrimaryKeyConstraint('id'),
    sa.UniqueConstraint('filename')
    )
    ### end Alembic commands ###


def downgrade():
    ### commands auto generated by Alembic - please adjust! ###
    op.drop_table('media')
    ### end Alembic commands ###
