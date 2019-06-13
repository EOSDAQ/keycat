import React from 'react'
import styled from 'styled-components'
import { Field } from 'formik'
import { Input } from 'design/atoms/Input'
import FieldError from './FieldError';

interface Props {
  hidden?: boolean,
  plain?: boolean,
  name?: string,
}

const Container = styled.div`
  &[data-hidden="true"] {
    height: 0px;
    overflow: hidden;
    margin-top: 0px;
  }

  margin-top: 12px;
`

const PasswordField: React.SFC<Props> = ({ hidden, name = 'password', plain }) => {
  const fieldName = 'password'
  return (
    <Container data-hidden={hidden}>
      <Field
        name={fieldName}
        render={({ field }) => (
          <Input
            {...field}
            name={name}
            // value={fieldName !== name ? "" : field.value}
            type="password"
            placeholder="Private Key"
            autoComplete={plain ? "off" : "current-password"}
            tabIndex={hidden ? -1 : 0}
            spellCheck="false"
          />
        )}
      />
      {!hidden && (
        <FieldError name="password" />
      )}
    </Container>
  )
}

export default PasswordField
