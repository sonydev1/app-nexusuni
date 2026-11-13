import { connection } from 'next/server'
import { getDepartmentOptions } from '@/features/programs/services/queries'
import { getCourseOptions, getCourses } from '../services/queries'
import CoursesTable from './courses-table'

export default async function CoursesData() {
  await connection()
  const [courses, departments, courseOptions] = await Promise.all([
    getCourses(),
    getDepartmentOptions(),
    getCourseOptions(),
  ])
  return <CoursesTable data={courses} departments={departments} courseOptions={courseOptions} />
}