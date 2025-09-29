// src/app/page.tsx


import React from 'react'
import styles from './styles/page.module.css'
import Link from 'next/link'
import Button from '@/components/common/button/Button'

export default function page() {
    return (
        <main className={styles.main}>
            <Link href={'/map'}>
                <Button
                    variant='primary'
                    size='medium'
                    label='Map'
                    showIcon
                />
            </Link>

            <h1>Hello</h1>
            <h2>Hello</h2>
        </main>
    )
}