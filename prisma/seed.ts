import { db } from "#app/utils/db.server.ts"

// import { db } from "~/utils/db.server"
import { faker } from "@faker-js/faker"
import { UniqueEnforcer } from 'enforce-unique'

const uniqueUsernameEnforcer = new UniqueEnforcer()

// async function seed() {
    
//     await Promise.all(
//         insertAdmin().map((user) => {
//             return db.admin.create({ data: user })
//         })
//     )

// }

// seed()

// function insertAdmin() {
//     return [
//         {
//             name: "Admin",
//             email: "admin@gmail.com",
//             password: "$2a$12$m5sKxZQvOIGrEtdKBxhM6u1lpNWRCbKffwNUttcLrFB7P/LTNv1me"
//         }
//     ]
// }

function getUser() {
    const firstName = faker.person.firstName()
    const lastName = faker.person.lastName()

    const userName = uniqueUsernameEnforcer
    .enforce(() => {
        return (
            faker.string.alphanumeric({ length: 2 }) +
            '_' +
            faker.internet.userName({
                firstName: firstName.toLowerCase(),
                lastName: lastName.toLowerCase(),
            })
        )
    })
    .slice(0, 20)
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, '_')

    const password = "$2a$12$m5sKxZQvOIGrEtdKBxhM6u1lpNWRCbKffwNUttcLrFB7P/LTNv1me"
    
    return {
        name: firstName + ' ' + lastName,
        email: userName + '@example.com',
        password
    }
}

function test() {
    console.log(Array.from({ length: faker.number.int({ min: 10, max: 11 }) }))
}

async function seed() {
    console.log("Seeding...")

    console.log("Start with admin")
    await db.admin.create({
        data: {
            name: "Admin",
            email: "admin@gmail.com",
            password: "$2a$12$m5sKxZQvOIGrEtdKBxhM6u1lpNWRCbKffwNUttcLrFB7P/LTNv1me"
        }
    })
    console.log("End with admin")

    
    console.log("Start with admin institution, institution, teacher, class, subject question, subject answer, student")

    const totalAdminInstitutions = 3

    const types_institute = ['state', 'private']
    const form_institute = ['college', 'school']
    const letters = ['A', 'B', 'C', 'D', 'E']
    const courses = ['Romana', 'Matematica', 'Informatica', 'Engleza', 'Germana', 'Biologie', 'Istorie', 'Chimie', 'Sport', 'Geografie', 'Fizica']
    const booleans = [true, false]
    const type_subjects = ['grid', 'code', 'write']
    const values_correction_type = ['auto', 'manual']

    const class_teacher_array = Array.from({
        length: faker.number.int({ min: 10, max: 11 })
    })

    const students_parents_array = Array.from({
        length: faker.number.int({ min: 25, max: 30 })
    })

    const subjects_array = Array.from({
        length: faker.number.int({ min: 40, max: 50 })
    })

    const answers_subject_array = Array.from({
        length: faker.number.int({ min: 4, max: 6 })
    })

    for (let index = 0; index < totalAdminInstitutions; index++) {
        const admin = getUser()

        await db.adminInstitution.create({
            data: {
                ...admin,
                institution: {
                    create: {
                        name: faker.company.name(),
                        type: types_institute[Math.floor(Math.random() * types_institute.length)],
                        form: form_institute[Math.floor(Math.random() * form_institute.length)],
                        address: faker.location.streetAddress(),

                        classes: {
                            create: class_teacher_array.map(() => ({
                                number: '' + faker.number.int({ min: 9, max: 13 }),
                                letter: letters[Math.floor(Math.random() * letters.length)],
                                students: {
                                    create: students_parents_array.map(() => {
                                        const student = getUser()

                                        return {
                                            ...student
                                        }
                                    })
                                }
                            }))
                        },

                        teachers: {
                            create: class_teacher_array.map((item, index) => {
                                const teacher = getUser()

                                const get_type_subject = type_subjects[Math.floor(Math.random() * type_subjects.length)]

                                if (get_type_subject === "grid") { 
                                    return {
                                        ...teacher,
                                        course: courses[index],
                                        subjects: {
                                            create: subjects_array.map(() => ({
                                                requirement: faker.lorem.sentence() + '?',
                                                requirement_type: get_type_subject,
                                                correction_type: values_correction_type[Math.floor(Math.random() * values_correction_type.length)],
                                                score: faker.number.int({ min: 0, max: 10, }) + '',
                                                answers: {
                                                    create: answers_subject_array.map(() => ({
                                                        answer: faker.lorem.sentence(),
                                                        positive: booleans[Math.floor(Math.random() * booleans.length)],
                                                    }))
                                                }
                                            }))
                                        }
                                    }
                                } else {
                                    return {
                                        ...teacher,
                                        course: courses[index],
                                        subjects: {
                                            create: subjects_array.map(() => ({
                                                requirement: faker.lorem.sentence() + '?',
                                                requirement_type: get_type_subject,
                                                correction_type: values_correction_type[Math.floor(Math.random() * values_correction_type.length)],
                                                score: faker.number.int({ min: 0, max: 10, }) + ''
                                            }))
                                        }
                                    }
                                }
                            })
                        }
                    }
                }
            }
        })
    }

    console.log("End with admin institution, institution, teacher, class, subject question, subject answer, student")

    console.log("Start with grade and solutions")

    const institutions = await db.institution.findMany({
        include: {
            teachers: {
                include: {
                    subjects: {
                        include: {
                            answers: true
                        }
                    }
                }
            },
            classes: {
                include: {
                    students: true
                }
            }
        }
    })

    institutions.forEach( async (institution) => {

        institution.teachers.forEach( async (teacher) => {

            institution.classes.forEach( async (item_class) => {

                item_class.students.forEach( async (student) => {

                    const subjects = teacher.subjects

                    const selected_subjects = 9

                    const results_subjects = subjects.slice(Math.floor(Math.random() * subjects.length), Math.floor(Math.random() * subjects.length) + selected_subjects);
    
                    await db.grade.create({
                        select: { id: true },
                        data: {
                            studentId: student.id,
                            teacherId: teacher.id,
                            timeToResolve: new Date(),
                            name: faker.word.sample(),
                            mark: faker.number.int({ min: 10, max: 100 }) + '',
                            solutions: {
                                create: results_subjects.map((item) => ({
                                    questionId: item.id,
                                    answerId: item.answers[Math.floor(Math.random() * item.answers.length)]?.id + '',
                                    answerContent: '',
                                    mark: faker.number.int({ min: 0, max: 10 }) + ''
                                }))
                            }
                        }
                    })
    
                })
    
            })

        })

    })

}

seed()
// test()