import * as ActionTypes from './ActionTypes';
import { backendUrl } from '../shared/urls';
import { imagePreFetcher } from '../shared/imagePrefetcher';

/*  ----------------------------------- 
    methods to track whether page entry animations
    have rendered.
    -----------------------------------  */
export const setHomePage = () => {
    return ({
        type: ActionTypes.SET_HOMEPAGE_STATE
        });
}

export const setLogoState = ({state}) => {
    return ({
        type: ActionTypes.SET_LOGOCUBE_STATE,
        state: state
        });
}

/*  ----------------------------------- 
    methods to fetch data from api / cdn
    -----------------------------------  */
export const fetchSpecialties = () => (dispatch) => {
    dispatch(specialtiesLoading(true));

    return fetch(backendUrl + "posts?categories=43&_embed&per_page=100")
    .then(
        response => {
            if (response.ok) {
                return response;
            } else {
                var error = new Error('Error ' + response.status + ': ' + response.statusText);
                error.response = response;
                throw error;
            }
        },
        error => {
            var errmess = new Error(error.message);
            throw errmess;
        })
    .then(response => response.json())
    .then(specialties => dispatch(addSpecialties(specialties)))
    .then(specialties => {
        imagePreFetcher(specialties.payload, 0, "Specialities");
        imagePreFetcher([
            "https://cdn.fotomashup.com/2020/06/10214318/y9bfvi6080121.jpg",
            "https://cdn.fotomashup.com/2020/06/10214304/xf366110106c3d40f98d8dbbe7decab0a-700.jpg",
            "https://cdn.fotomashup.com/2020/06/10214241/Wonderland-004.jpg",
            "https://cdn.fotomashup.com/2020/06/10214231/women-model-black-hair-leather-latex-catsuit-323011-wallhere.com_.jpg",
            "https://cdn.fotomashup.com/2020/06/10214226/women-looking-at-viewer-stockings-black-hair-kitchen-boobs-lingerie-clothing-French-Maid-Leah-Francis-lady-leg-costume-undergarment-fetish-model-soubrette-339304.jpg",
            "https://cdn.fotomashup.com/2020/06/10214206/women-1591617702767-5078.jpg",
        ], 5, "Site Static")
        })
    .catch(error => dispatch(specialtiesFailed(error.message)));

}

export const specialtiesLoading = () => ({
    type: ActionTypes.SPECIALTIES_LOADING
});

export const specialtiesFailed = (errmess) => ({
    type: ActionTypes.SPECIALTIES_FAILED,
    payload: errmess
});

export const addSpecialties = (specialties) => ({
    type: ActionTypes.ADD_SPECIALTIES,
    payload: specialties
});

