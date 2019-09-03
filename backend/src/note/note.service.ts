import { Injectable } from '@nestjs/common';

@Injectable()
export class NoteService {
    getHello(): string {
        return 'Hello World!';
    }
}
