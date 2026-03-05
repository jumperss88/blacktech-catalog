'use client'

import React, { useState } from 'react'

type Props = {
  submitLabel: string
}

type FormState = {
  company: string
  email: string
  message: string
  name: string
  phone: string
}

const initialState: FormState = {
  company: '',
  email: '',
  message: '',
  name: '',
  phone: '',
}

export const ContactsHubForm: React.FC<Props> = ({ submitLabel }) => {
  const [form, setForm] = useState<FormState>(initialState)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const onChange =
    (key: keyof FormState) => (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setForm((prev) => ({ ...prev, [key]: event.target.value }))
    }

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')
    setSuccess('')

    if (!form.phone.trim() && !form.email.trim()) {
      setError('Укажите телефон или email.')
      return
    }

    if (form.message.trim().length < 5) {
      setError('Сообщение должно быть длиннее 5 символов.')
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch('/api/contact-messages/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(form),
      })

      const result = (await response.json()) as { error?: string }

      if (!response.ok) {
        setError(result.error || 'Не удалось отправить сообщение.')
        return
      }

      setSuccess('Сообщение отправлено. Мы свяжемся с вами в рабочее время.')
      setForm(initialState)
    } catch {
      setError('Не удалось отправить сообщение. Попробуйте ещё раз.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form className="contacts-form" onSubmit={onSubmit}>
      <div className="contacts-form-grid">
        <label>
          <span>Имя</span>
          <input value={form.name} onChange={onChange('name')} />
        </label>
        <label>
          <span>Компания</span>
          <input value={form.company} onChange={onChange('company')} />
        </label>
        <label>
          <span>Телефон</span>
          <input value={form.phone} onChange={onChange('phone')} />
        </label>
        <label>
          <span>Email</span>
          <input value={form.email} onChange={onChange('email')} />
        </label>
      </div>

      <label className="contacts-form-textarea">
        <span>Сообщение</span>
        <textarea rows={6} value={form.message} onChange={onChange('message')} />
      </label>

      {error ? <p className="contacts-form-error">{error}</p> : null}
      {success ? <p className="contacts-form-success">{success}</p> : null}

      <button disabled={isLoading} type="submit">
        {isLoading ? 'Отправка...' : submitLabel}
      </button>
    </form>
  )
}
