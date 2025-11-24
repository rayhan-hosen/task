import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import DOMPurify from 'dompurify';

export default function RegisterPage() {
    const { register } = useAuth();
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [repeatPassword, setRepeatPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const [passwordCriteria, setPasswordCriteria] = useState({
        minLength: false,
        upperCase: false,
        lowerCase: false,
        number: false,
        specialChar: false,
    });

    const checkPasswordStrength = (pass) => {
        setPasswordCriteria({
            minLength: pass.length >= 8,
            upperCase: /[A-Z]/.test(pass),
            lowerCase: /[a-z]/.test(pass),
            number: /\d/.test(pass),
            specialChar: /[\W_]/.test(pass),
        });
    };

    const handlePasswordChange = (e) => {
        const val = e.target.value;
        setPassword(val);
        checkPasswordStrength(val);
        if (error) setError('');
    };

    const isPasswordValid = Object.values(passwordCriteria).every(Boolean);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        if (!isPasswordValid) {
            setError('Please meet all password requirements');
            setLoading(false);
            return;
        }

        if (password !== repeatPassword) {
            setError('Passwords do not match');
            setLoading(false);
            return;
        }
        try {
            // Sanitize inputs to prevent Stored XSS in user profile
            const cleanFirstName = DOMPurify.sanitize(firstName);
            const cleanLastName = DOMPurify.sanitize(lastName);
            const cleanEmail = DOMPurify.sanitize(email);
            
            // Note: Never sanitize passwords with DOMPurify, it will break hashing
            await register({ firstName: cleanFirstName, lastName: cleanLastName, email: cleanEmail, password });
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (setter) => (e) => {
        setter(e.target.value);
        if (error) setError('');
    };

    return (
        <section className="_social_registration_wrapper _layout_main_wrapper">
            <div className="_shape_one">
                <img src="/assets/images/shape1.svg" alt="" className="_shape_img" />
                <img src="/assets/images/dark_shape.svg" alt="" className="_dark_shape" />
            </div>
            <div className="_shape_two">
                <img src="/assets/images/shape2.svg" alt="" className="_shape_img" />
                <img src="/assets/images/dark_shape1.svg" alt="" className="_dark_shape _dark_shape_opacity" />
            </div>
            <div className="_shape_three">
                <img src="/assets/images/shape3.svg" alt="" className="_shape_img" />
                <img src="/assets/images/dark_shape2.svg" alt="" className="_dark_shape _dark_shape_opacity" />
            </div>
            <div className="_social_registration_wrap">
                <div className="container">
                    <div className="row align-items-center">
                        <div className="col-xl-8 col-lg-8 col-md-12 col-sm-12">
                            <div className="_social_registration_right">
                                <div className="_social_registration_right_image">
                                    <img src="/assets/images/registration.png" alt="Image" />
                                </div>
                                <div className="_social_registration_right_image_dark">
                                    <img src="/assets/images/registration1.png" alt="Image" />
                                </div>
                            </div>
                        </div>
                        <div className="col-xl-4 col-lg-4 col-md-12 col-sm-12">
                            <div className="_social_registration_content">
                                <div className="_social_registration_right_logo _mar_b28">
                                    <img src="/assets/images/logo.svg" alt="Image" className="_right_logo" />
                                </div>
                                <p className="_social_registration_content_para _mar_b8">Get Started Now</p>
                                <h4 className="_social_registration_content_title _titl4 _mar_b50">Registration</h4>
                                <button type="button" className="_social_registration_content_btn _mar_b40">
                                    <img src="/assets/images/google.svg" alt="Image" className="_google_img" /> <span>Register with google</span>
                                </button>
                                <div className="_social_registration_content_bottom_txt _mar_b40"> <span>Or</span>
                                </div>
                                <form className="_social_registration_form" onSubmit={handleSubmit}>
                                    <div className="row">
                                        <div className="col-xl-6 col-lg-6 col-md-12 col-sm-12">
                                            <div className="_social_registration_form_input _mar_b14">
                                                <label className="_social_registration_label _mar_b8">First Name</label>
                                                <input type="text" className="form-control _social_registration_input" value={firstName} onChange={handleInputChange(setFirstName)} required />
                                            </div>
                                        </div>
                                        <div className="col-xl-6 col-lg-6 col-md-12 col-sm-12">
                                            <div className="_social_registration_form_input _mar_b14">
                                                <label className="_social_registration_label _mar_b8">Last Name</label>
                                                <input type="text" className="form-control _social_registration_input" value={lastName} onChange={handleInputChange(setLastName)} required />
                                            </div>
                                        </div>
                                        <div className="col-xl-12 col-lg-12 col-md-12 col-sm-12">
                                            <div className="_social_registration_form_input _mar_b14">
                                                <label className="_social_registration_label _mar_b8">Email</label>
                                                <input type="email" className="form-control _social_registration_input" value={email} onChange={handleInputChange(setEmail)} required />
                                            </div>
                                        </div>
                                        <div className="col-xl-12 col-lg-12 col-md-12 col-sm-12">
                                            <div className="_social_registration_form_input _mar_b14">
                                                <label className="_social_registration_label _mar_b8">Password</label>
                                                <input type="password" className="form-control _social_registration_input" value={password} onChange={handlePasswordChange} required />
                                                <div className="mt-2">
                                                    <small className={`d-block ${passwordCriteria.minLength ? 'text-success' : 'text-danger'}`}>
                                                        {passwordCriteria.minLength ? '✓' : '✗'} Min 8 characters
                                                    </small>
                                                    <small className={`d-block ${passwordCriteria.upperCase ? 'text-success' : 'text-danger'}`}>
                                                        {passwordCriteria.upperCase ? '✓' : '✗'} Uppercase letter
                                                    </small>
                                                    <small className={`d-block ${passwordCriteria.lowerCase ? 'text-success' : 'text-danger'}`}>
                                                        {passwordCriteria.lowerCase ? '✓' : '✗'} Lowercase letter
                                                    </small>
                                                    <small className={`d-block ${passwordCriteria.number ? 'text-success' : 'text-danger'}`}>
                                                        {passwordCriteria.number ? '✓' : '✗'} Number
                                                    </small>
                                                    <small className={`d-block ${passwordCriteria.specialChar ? 'text-success' : 'text-danger'}`}>
                                                        {passwordCriteria.specialChar ? '✓' : '✗'} Special character
                                                    </small>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-xl-12 col-lg-12 col-md-12 col-sm-12">
                                            <div className="_social_registration_form_input _mar_b14">
                                                <label className="_social_registration_label _mar_b8">Repeat Password</label>
                                                <input type="password" className="form-control _social_registration_input" value={repeatPassword} onChange={handleInputChange(setRepeatPassword)} required />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="row">
                                        <div className="col-lg-12 col-xl-12 col-md-12 col-sm-12">
                                            <div className="form-check _social_registration_form_check">
                                                <input className="form-check-input _social_registration_form_check_input" type="radio" name="flexRadioDefault" id="flexRadioDefault2" defaultChecked />
                                                <label className="form-check-label _social_registration_form_check_label" htmlFor="flexRadioDefault2">I agree to terms & conditions</label>
                                            </div>
                                        </div>
                                    </div>
                                    {error && (
                                        <div className="alert alert-danger mt-3" role="alert">
                                            {error}
                                        </div>
                                    )}
                                    <div className="row">
                                        <div className="col-lg-12 col-md-12 col-xl-12 col-sm-12">
                                            <div className="_social_registration_form_btn _mar_t40 _mar_b60">
                                                <button type="submit" className="_social_registration_form_btn_link _btn1" disabled={loading || !isPasswordValid}>
                                                    {loading ? 'Registering...' : 'Register now'}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </form>
                                <div className="row">
                                    <div className="col-xl-12 col-lg-12 col-md-12 col-sm-12">
                                        <div className="_social_registration_bottom_txt">
                                            <p className="_social_registration_bottom_txt_para">Already have an account? <Link to="/login">Login</Link>
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}