import { Module } from '@nestjs/common';
import { NoteController } from './note.controller';
import { NoteService } from './note.service';

@Module({
    imports: [],
    controllers: [NoteController],
    providers: [NoteService],
})
export class NoteModule { }
