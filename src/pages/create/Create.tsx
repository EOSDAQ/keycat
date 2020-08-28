import React, { useState, useEffect } from 'react'
import { useStore } from '../../store/store'
import { Link, navigate } from '@reach/router'
import Submit from 'design/moles/fields/Submit'
import CardLayout from 'design/layouts/CardLayout'
import { Fields } from 'design/atoms/Input'
import SpinnerField from 'design/moles/fields/SpinnerField'
import { Form } from 'design/moles/form/Form'
import { appendSearchParamsToUrl } from 'utils'
import axios from 'axios'
import { useBlockchain } from '../../hooks/blockchainHooks'
import InputError from '../../design/moles/fields/InputError'

const CreateAccount = props => {
  const plugin = useBlockchain()
  const [isValid, setIsValid] = useState(false)
  const [isAvailable, setIsAvailable] = useState(false)
  const [isCreatingAccount, setIsCreatingAccount] = useState(false)
  const [isCheckingAvailability, setIsCheckingAvailability] = useState(false)
  const [errors, setErrors] = useState({})
  const [accountHandle, setAccountHandle] = useState('')
  const [keys, setKeys] = useState(null)
  const store = useStore()
  const {
    config: {
      blockchain: { nodes },
    },
  } = store

  const onClickSignin = () => {
    navigate(appendSearchParamsToUrl('/signin'))
  }

  const fetchHandleAvailability = async () => {
    console.log('fetching handle: ', accountHandle)
    try {
      const handleAvailabilityResponse = await axios({
        url: `${nodes[0]}/v1/accounts/${accountHandle}`,
      })
      if (handleAvailabilityResponse.data === 204) {
        setIsAvailable(true)
      }
    } catch (error) {
      console.log('error case, error: ', error)
      if (error.response.status === 400) {
        setErrors({
          accountHandle: {
            message: 'Account handle unavailable, please try another',
            name: 'CreateAccountError',
          },
        })
      }
    } finally {
      setIsCheckingAvailability(false)
    }
  }

  useEffect(() => {
    if (accountHandle && isValid) {
      setIsCheckingAvailability(true)
      const timer = setTimeout(fetchHandleAvailability, 500)
      return () => clearTimeout(timer)
    }
  }, [accountHandle])

  const onChangeAccountHandle = (e: any) => {
    setErrors({})
    const newAccountHandle = e.target.value
    const regexPattern = new RegExp(/^[a-z1-5]+$/i)
    if (newAccountHandle.length !== 12 || !regexPattern.test(newAccountHandle)) {
      setErrors({
        accountHandle: {
          message: 'Invalid account handle. Must be 12 characters long, alphabetical, or 1-5',
          name: 'CreateAccountError',
        },
      })
      setIsAvailable(false) // for now assume invalid handles unavailable
      setIsValid(false)
    } else {
      setIsValid(true)
    }
    setAccountHandle(newAccountHandle)
  }

  useEffect(() => {
    generateKeys()
  }, [])

  const generateKeys = async () => {
    console.log('generating keys,  keys were: ', keys)
    const blockchain = await plugin.wait()
    const activeKeys = await blockchain.getNewKeyPair()
    const ownerKeys = await blockchain.getNewKeyPair()
    console.log('setting keys to: ', activeKeys, ownerKeys)
    setKeys({
      activeKeys,
      ownerKeys,
    })
  }

  const onClickSubmit = async ({ values }) => {
    setIsCreatingAccount(true)
    console.log('onClickSubmit, keys: ', keys)
    console.log('onClickSubmit, values: ', values)
    try {
      const createAccountResponse = await axios({
        url: 'https://api.telos.net/v1/testnet/account',
        method: 'POST',
        data: {
          accountName: accountHandle,
          ownerKey: keys.ownerKeys.publicKey,
          activeKey: keys.activeKeys.publicKey,
        },
      })
      console.log('createAccountResponse: ', createAccountResponse)
      if (createAccountResponse.status !== 200) {
        throw new Error()
      }
      navigate('/review', { state: { accountHandle, keys } })
    } catch (error) {
      console.log('error: ', error)
    } finally {
      setIsCreatingAccount(false)
    }
  }

  const isSubmitDisabled = isCheckingAvailability || isCreatingAccount || !isValid || !isAvailable
  console.log('keys: ', keys)
  return (
    <CardLayout title="Create Telos Testnet Account">
      <Fields>
        <SpinnerField onChange={onChangeAccountHandle} isLoading={isCheckingAvailability} name={'accountHandle'} />
        <InputError message={errors.accountHandle && errors.accountHandle.message} />
      </Fields>
      <Submit
        disabled={isSubmitDisabled}
        sibling={() => <Link to={appendSearchParamsToUrl('/register')}>Import Account</Link>}
        onClick={onClickSubmit}
      >
        {isCreatingAccount ? <i className={'loader loading'}></i> : 'Create'}
      </Submit>
      <Submit onClick={onClickSignin}>Sign in</Submit>
    </CardLayout>
  )
}

export default CreateAccount
