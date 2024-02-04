// import { db } from "./db.server"
// import { message_list } from "./list.values"

import { useEffect, useState } from "react";
import fs from 'fs'
import path from "path"
import * as child_process from 'child_process'

// export const check_type_user = (
//     typeUser: string | null,
//     compareUser: string[]
// ) => {
//     let checks = 0
//     compareUser.forEach((item) => {
    
//         if (typeUser !== item) {
//             checks++
//         }

//     })

//     console.log(checks)

//     if (checks === compareUser.length) {
//         return {
//             status: 401,
//             message: message_list.access_rights,
//             data: null
//         }
//     }
// }

// export const check_admin_exist = async (
//     id: string | null,
// ) => {

//     if (!id) {
//         return {
//             status: 400,
//             message: message_list.went_wrong,
//             data: null
//         }
//     }

//     const adminExists = await db.admin.findUnique({
//         where: { id }
//     })

//     return adminExists

// }

// export const check_admin_institution_exist = async (
//     id: string | null,
//     include_ins: boolean
// ) => {

//     if (!id) {
//         return {
//             status: 400,
//             message: message_list.went_wrong,
//             data: null
//         }
//     }

//     const adminExists = await db.adminInstitution.findUnique({
//         where: { id },
//         include: {
//             institution: include_ins
//         }
//     })

//     return {
//         status: 200,
//         message: message_list.success,
//         data: adminExists
//     }

// }

// export const check_user_exist = async (
//     adminId: string | null,
//     adminInstitutionId: string | null,
//     includeInstitution: boolean
// ) => {

//     if (!adminId && !adminInstitutionId) {
//         return {
//             status: 400,
//             message: message_list.went_wrong,
//             data: null
//         }
//     }

//     let adminExists = null

//     if (adminId) {

//         const id = adminId

//         adminExists = await db.admin.findUnique({
//             where: { id }
//         })

//     }
    
//     if (adminInstitutionId) {

//         const id = adminInstitutionId

//         adminExists = await db.adminInstitution.findUnique({
//             where: { id },
//             include: {
//                 institution: includeInstitution
//             }
//         })

//     }

//     return adminExists

// }
function padTo2Digits(num: number) {
    return num.toString().padStart(2, '0');
}

export function convertMsToTime(milliseconds: number) {
    let seconds = Math.floor(milliseconds / 1000);
    let minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
  
    seconds = seconds % 60;
    minutes = minutes % 60;
  
    // 👇️ If you want to roll hours over, e.g. 00 to 24
    // 👇️ uncomment the line below
    // uncommenting next line gets you `00:00:00` instead of `24:00:00`
    // or `12:15:31` instead of `36:15:31`, etc.
    // 👇️ (roll hours over)
    // hours = hours % 24;
  
    return {
      time: `${padTo2Digits(hours)}:${padTo2Digits(minutes)}:${padTo2Digits(seconds)}`,
      hours: hours,
      minutes: minutes,
      seconds: seconds
    };
}

export function useIsTabVisible() {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    document.addEventListener('visibilitychange', () => {
      setIsVisible(!document.hidden)
    })

    return () => {
      document.removeEventListener('visibilitychange', () => {
        setIsVisible(!document.hidden)
      })
    }
  }, [])

  return isVisible
}

export async function runCodeC({ id, data, example, variables, variables_modified, structures, restrict_and_specs }: {
  id: string,
  data: string,
  example?: string,
  variables?: string,
  variables_modified?: string,
  structures?: string,
  restrict_and_specs?: string
}) {

  const pathDir: string = `app/codes/sol_${id}`
  const filePathC: string = path.join(pathDir, 'code.cpp')
  const filePathExe: string = path.join(pathDir, 'runner.exe') 
  const filePathResults: string = path.join(pathDir, 'results.txt') 

  const exists_dir = fs.existsSync(pathDir)

  if (!exists_dir) {
    fs.mkdirSync(pathDir)
  }

  await fs.promises.writeFile(filePathC, data)

  await fs.promises.writeFile(filePathResults, 'RESULTS\n\n')

  const split_example = []
  // const split_variables = []
  const split_variables_modified = []
  const split_structures = []
  const split_restrict_and_specs = []

  example?.split(',').forEach((exe) => {

    split_example.push({
      in: exe.split('in: ')[1].split('out: ')[0],
      out: exe.split('in: ')[1].split('out: ')[1],
    })

  })

  variables_modified?.split(',').forEach((vm) => {

    split_variables_modified.push(vm)

  })

  structures?.split(',').forEach(async (str) => {

    split_structures.push(str)

    if (!data.includes(str)) {
      // count_incomplete++
      await fs.promises.appendFile(filePathResults, 'term_incomplete\n')
    } else {
      await fs.promises.appendFile(filePathResults, 'term_complete\n')
    }

    // count_checks++
    // await fs.promises.appendFile(filePathResults, 'term_check')

  })

  restrict_and_specs?.split(',').forEach((rs) => {

    split_restrict_and_specs.push(rs)

  })

  let length_split_example = split_example.length

  split_example.forEach(async (se) => {
    const childProcess = child_process.spawnSync('g++', [filePathC, '-o', filePathExe]);

    // childProcess.on('exit', async (code) => {
    //   if (code === 0) {

    //     // const child = child_process.spawnSync(filePathExe);

    //     // console.log('Global output:', child.output.toString('utf8')); // Print global output

    //     console.log(`Child exited successfully.`);
    //   } else {
    //     console.error('Error compiling C++ file:', code);
    //     // return 'Error compiling C++ file:' + code
    //   }
    // });

    const execChildProcess = child_process.exec('C:/Users/geze/Desktop/my_projects/project_school_v_1/' + filePathExe, async (error, stdout, stderr) => {
      if (error) {
        console.error('Error executing C++ code:', error);
        await fs.promises.appendFile(filePathResults, '\nERRORFILE')
        return {
          status: 400,
          message: console.error('Error executing C++ code:', error),
        }
      } else {
        console.log('C++ code execution successful');
      }
    });



    console.log("input_process: ", se.in)
    execChildProcess.stdin.write(se.in); // Send values as a string

    execChildProcess.stdin.end(); // Signal the end of data

    execChildProcess.stdout.on('data', async (data) => {
      console.log(`output_process: ${data}`);

      if (se.out !== data) {
        console.log("bad_test: ", se.out + ' ', data)
        // count_tests_bad++
        await fs.promises.appendFile(filePathResults, 'test_bad\n')
      } else {
        console.log("good_test: ", se.out + ' ', data)
        // count_tests_corrected++
        await fs.promises.appendFile(filePathResults, 'test_good\n')
      }
    })



    execChildProcess.on('exit', async (code) => {
      if (code === 0) {
        console.log(`Child exited successfully.`);
        execChildProcess.kill()
        length_split_example--
        if (length_split_example === 0) {
          await fs.promises.appendFile(filePathResults, '\nENDFILE')
        }
      } else {
        console.error('Error compiling C++ file:', code);
      }
    });


  })

  const result_file = await fs.promises.readFile(filePathResults, 'utf8')

  return result_file
}