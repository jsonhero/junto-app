import { Get, Controller, Post, Body } from '@nestjs/common';

@Controller('note')
export class NoteController {
    @Get('/')
    test(): string {
        return 'Hello World!';
    }

    @Post('/')
    create(@Body() noteData: any): any {
        console.log(noteData, ':: NOTE DATA')
        return 'Hello World!';
    }
}