import React, { useState, useMemo, useRef } from 'react'

type UseFormProps = {
  fields: { [key: string]: any },
  validateFields?: (
    fields: {
      [key: string]: any
    }
  ) => {
    [key: string]: boolean
  }
}

type FormState = {
  fields: FormFields,
  valid: FormFieldsValid,
  [key: string]: any
}
type FormFields = { [key: string]: any }
type FormFieldsValid = { [key: string]: boolean }

type UseForm = FormState & {
  setFormState: React.Dispatch<React.SetStateAction<FormState>>,
  setFields: (fieldsData: { [key: string]: any }) => void,
  setField: (name: string, value: any) => void,
  /**
   * setValid returns true if all fields are valid
   */
  setValid: (valid: FormFieldsValid) => boolean,
  getFieldAttributes: (name: string) => { [key: string]: any }
}

export const useForm = (props: UseFormProps): UseForm => {

  const {
    fields,
  } = props

  const initState: FormState = useMemo(() => ({
    fields,
    valid: Object.keys(fields).reduce((obj: { [key: string]: any }, key) => {
      // True by default for initial form render
      obj[key] = true
      return obj
    }, {})
  }), [])

  const [formState, _setFormState] = useState(initState)

  const stateRef = useRef(formState)
  stateRef.current = formState

  const setFormState = useMemo(() => newState => {
    stateRef.current = newState
    _setFormState(newState)
  }, [])

  const methods = useMemo(() => {

    const setFields = (fieldsData: { [key: string]: any }) => {
      const fields = {
        ...stateRef.current.fields,
        ...fieldsData
      }

      setFormState({
        ...stateRef.current,
        fields,
      })
    }

    const setField = (name: string, value: any) => setFields({
      [name]: value
    })

    const setValid = (validPartial: FormFieldsValid) => {

      const valid: FormFieldsValid = {
        ...stateRef.current.valid,
        ...validPartial
      }

      setFormState({
        ...stateRef.current,
        valid
      })

      return Object.keys(valid).reduce((result, key) => {
        return result && valid[key]===true
      }, true)
    }

    return {
      setFields,
      setField,
      setValid,
      setFormState: (newState: { [key: string]: any }) => setFormState({
        ...stateRef.current,
        ...newState,
      }),
      getFieldAttributes: (name: string, attr?: { [key: string]: any }) => ({
        name,
        value: stateRef.current.fields[name],
        onChange: (e: any) => setField(name, e.target.value),
        ref: el => {
          // Get possibly auto-filled value
          if (el && !el._formFieldAutoFillChecked && el.value) {
            el._formFieldAutoFillChecked = true
            setField(name, el.value)
          }
          attr && attr.ref && attr.ref(el)
        },
        ...attr,
        className: (
          stateRef.current.valid[name]===false ? 'is-error' : ''
        )+(
          attr && attr.className ? ` ${attr.className}` : ''
        )
      })
    }
  }, [])

  return {
    ...formState,
    ...methods
  }
}
