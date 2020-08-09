import db from '../database/connection'
import convertHourToMinutes from '../utts/convertHoursToMinute';
import { Request, Response} from 'express'

interface scheduleItem {
    week_day: number;
    from: string;
    to: string;

}



export default class ClassesController {
    async index(request: Request, response: Response) {
        const filters = request.query;

        if (!filters.subject || !filters.week_day || !filters.time ) {
            return response.status(400).json({
                error:'Missing filters to search classes'
                
            })
        }

const timeToMinutes = convertHourToMinutes(filters.time as string)

const classes = await db('classes')
        .whereExists(function() {
            this.select('class_schedule.*')
                .from('class_schedule')
                .whereRaw('`class_schedule`.`class_id` = `classes`.`id`')
                .whereRaw('`class_schedule`.`week_day` = ??', [Number(filters.week_day as string)])
                .whereRaw('`class_schedule`.`from` <= ??', [timeToMinutes])
                .whereRaw('`class_schedule`.`from` > ??', [timeToMinutes])
               
            })
        .where('classes.subject', '=', filters.subject as string)
        .join('users', 'classes.user_id', '=', 'user.id' )
        .select(['classes.*', 'users.*'])


  return response.json(classes);
    }


    async create(request: Request, response: Response) {
        const {
            name,
            avatar,
            whatsapp,
            bio,
            subject,
            cost,
            schedule
        } = request.body;
   
   
        const trx = await db.transaction();
          //tudo ao mesmo tempo 
   
   try {
   
   
     const insertUsersIds = await trx('users').insert({
       name,
       avatar,
       whatsapp,
       bio,
   });
   
   const user_id =  insertUsersIds[0]
   
   
   const insertedClassesIds = await trx('classes').insert({
       subject,
       cost,
       user_id,
   });
   
   const class_id = insertedClassesIds[0]
   
   
   const classSchedule = schedule.map((scheduleItem: scheduleItem) => {
       return {
            class_id,
            week_day: scheduleItem.week_day,
            from: convertHourToMinutes(scheduleItem.from),
            to: convertHourToMinutes(scheduleItem.to)
       }
   })
   
   
   await trx('class_schedule').insert(classSchedule)
   
   
   await trx.commit(); //fazer alterações
   
      return response.status(201).send();
   }catch(err) {
       console.log(err)
       await trx.rollback();
       return response.status(400).json({
           error:'Unexpected error while creating new class'
       
       })
     }
   }
}