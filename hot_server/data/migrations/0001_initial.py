# Generated by Django 2.2.7 on 2019-11-06 08:40

from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='SinaHot',
            fields=[
                ('id', models.AutoField(primary_key=True, serialize=False)),
                ('date_time', models.DateTimeField()),
                ('title', models.CharField(max_length=66)),
                ('rate', models.IntegerField()),
            ],
            options={
                'db_table': 'HOT_SEARCH',
            },
        ),
    ]
