import { Transform, Expose } from 'class-transformer';
import { Note } from '../entities/note.entity';
export class NoteDto {
  @Transform(({ obj }) => obj.map((noteObj: Note) => ({
     ...noteObj,
     appointmentId: noteObj.appointmentId.id,
  })))
  @Expose()
     notes: NoteDto[];
}
