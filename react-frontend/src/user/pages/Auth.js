import React, { useState, useContext } from 'react';
import { AuthContext } from '../../shared/context/auth-context';
import './Auth.css';
import Card from '../../shared/components/UIElements/Card';
import Input from '../../shared/components/FormsElements/Input';
import Button from '../../shared/components/FormsElements/Button';
import { VALIDATOR_MINLENGTH, VALIDATOR_EMAIL, VALIDATOR_REQUIRE } from '../../shared/util/validators';
import { useForm } from '../../shared/hooks/form-hook';
import ErrorModal from '../../shared/components/UIElements/ErrorModal';
import LoadingSpinner from '../../shared/components/UIElements/LoadingSpinner';
import { useHttpClient } from '../../shared/hooks/https-hook';
import ImageUpload from '../../shared/components/FormsElements/ImageUpload';

const Auth = props => {
    const auth = useContext(AuthContext);

    const [isLoginMode, setIsLoginMode] = useState(true);
    const { isLoading, error, sendRequest, clearError } = useHttpClient();

    const [formState, inputHandler, setFormData] = useForm({
        email: {
            value: '',
            isVaild: false
        },
        password: {
            value: '',
            isVaild: false
        }
    },false);

    const authSubmitHandler = async event => {
        event.preventDefault();
        console.log(formState.inputs);

        if(isLoginMode){
                try {
                    const responseData = await sendRequest(process.env.REACT_APP_BACKEND_URL + '/users/login',
                    'POST', 
                    JSON.stringify({
                        email: formState.inputs.email.value,
                        password: formState.inputs.password.value
                    }),
                    {
                        'Content-Type': 'application/json'
                    }
                );
                auth.login(responseData.userId, responseData.token);
                } catch (err) {
                    
                }     
        }else{
            const formData = new FormData();
            formData.append('email',formState.inputs.email.value);
            formData.append('name',formState.inputs.name.value);
            formData.append('password',formState.inputs.password.value);
            formData.append('image',formState.inputs.image.value);
            try {
                const responseData = await sendRequest(
                    process.env.REACT_APP_BACKEND_URL +'/users/signup', 
                    'POST',
                    formData
                );
                auth.login(responseData.userId, responseData.token);
            } catch (err) {
    
            }   
        }
    }

    const switchModeHanlder = () => {
        if(!isLoginMode) {
            setFormData(
                {   
                    ...formState.inputs,
                    name: undefined,
                    image: undefined
                },
                formState.inputs.email.isVaild && formState.inputs.password.isVaild
            )
        } else {
            setFormData({
                ...formState.inputs,
                name : {
                    value: '',
                    isVaild: false
                },
                image:{
                    value: null,
                    isVaild: false
                }
            }, false);
        }
        setIsLoginMode(prevMode => !prevMode);
    }

    return (
        <React.Fragment>
        <ErrorModal error={error} onClear={clearError}/>
        <Card className="authentication">
            {isLoading && <LoadingSpinner asOverlay/>}
            <h2>Login Required</h2>
            <hr />
            <form  onSubmit={authSubmitHandler}>
                {
                    !isLoginMode && 
                    ( 
                        <Input
                        element="input" id="name" type="text" 
                        label="Your Name" validators={[VALIDATOR_REQUIRE()]}
                        errorText="Please Enter a Name"
                        onInput={inputHandler}
                        /> 
                    )
                }
                {!isLoginMode && <ImageUpload center id="image" onInput={inputHandler} errorText="Please Provide an Image"/>}
                <Input id="email" element="input" type="email" label="E-mail" 
                validators={[VALIDATOR_EMAIL()]}
                errorText="Please enter valid email address"
                onInput={inputHandler}
                />
                <Input id="password" element="input" type="password" label="password" 
                validators={[VALIDATOR_MINLENGTH(6)]}
                errorText="Please enter valid password, at least 6 chracter"
                onInput={inputHandler}
                />
                <Button type="submit" disable={!formState.isVaild}>
                    {isLoginMode ? 'LOGIN' : 'SIGNUP' }
                </Button>
            </form>
            <Button inverse onClick={switchModeHanlder}>SWITCH TO { isLoginMode ? 'SIGNUP' : 'LOGIN' }
            </Button>
            </Card>
        </React.Fragment>
    )
}

export default Auth;
