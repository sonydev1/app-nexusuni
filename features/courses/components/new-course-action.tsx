import { connection } from 'next/server'
import { getDepartmentOptions } from '@/features/programs/services/queries'
import { getCourseOptions } from '../services/queries'
import NewCourseButton from './new-course-button'

export default async function NewCourseAction() {
  await connection()
  const [departments, courseOptions] = await Promise.all([
    getDepartmentOptions(),
    getCourseOptions(),
  ])
  return <NewCourseButton departments={departments} courseOptions={courseOptions} />
}