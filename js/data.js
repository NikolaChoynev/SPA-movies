import { beginRequest, endRequest, showError } from './notification.js';

function host(endpoint) {
    return `https://api.backendless.com/FF2C7117-48DC-A511-FF9E-A945DD9E4D00/0DDF1604-A60D-4FFD-849F-A1105FD33741/${endpoint}`
}

const endpoints = {
    REGISTER: 'users/register',
    LOGIN: 'users/login',
    LOGOUT: 'users/logout',
    MOVIES: 'data/movies',
    MOVIE_BY_ID: 'data/movies/'
};

//async function errorBoundary(fn) {
 //   return function(...params){
  //      try{
 //          return await fn(...params);
  //      } catch (err){
  //          showError(err.message);
  //      }
 //   }
//}

//const handledRequest = errorBoundary(post);

//handledRequest(endpoints.REGISTER, 'Peter', '123');

function getOptios() {
    const token = localStorage.getItem('userToken');

    const options = { headers: {} };

    if (token !== null) {
        options.headers = {
            'user-token': token
        };
    }
    return options;
}

async function get(endpoint) {

    beginRequest();
    const result = await fetch(host(endpoint), getOptios());
    endRequest();

    return result;
}
async function post(endpoint, body) {
    const options = getOptios();

    options.method = 'POST';
    options.headers['Content-type'] = 'application/json';
    options.body = JSON.stringify(body);

    beginRequest();

    const result = (await fetch(host(endpoint), options)).json();

    endRequest();

    return result;
}
export async function register(username, password) {
    beginRequest();
    const result = await (await fetch(host(endpoints.REGISTER), {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            username,
            password
        })

    })).json();

    endRequest();


    return result;
}
export async function login(username, password) {
    beginRequest();

    const result = await (await fetch(host(endpoints.LOGIN), {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            login: username,
            password
        })

    })).json();

    localStorage.setItem('userToken', result['user-token']);
    localStorage.setItem('username', result.username);
    localStorage.setItem('userId', result.objectId);

    endRequest();

    return result;

}

export async function logout() {
    localStorage.removeItem('userToken')
    return get(endpoints.LOGOUT);
}
//get all movies
export async function getMovies(search) {
    beginRequest();

    const token = localStorage.getItem('userToken');

    let result;
    if (!search) {
        result = await (await fetch(host(endpoints.MOVIES), {
            headers: {
                'user-token': token
            }
        })).json();
    } else {
        result = await (await fetch(host(endpoints.MOVIES + `?where=${escape(`genres LIKE '%${search}%'`)}`), {
            headers: {
                'user-token': token
            }
        })).json();

    }

    endRequest();

    return result;
}
//get movie by Id
export async function getMovieById(id) {
    beginRequest();

    const token = localStorage.getItem('userToken');

    const result = await (await fetch(host(endpoints.MOVIE_BY_ID + id), {
        headers: {
            'user-token': token
        }
    })).json();

    endRequest();

    return result;
}
//create movie
export async function createMovie(movie) {
    return post(endpoints.MOVIES, movie);
}
//edit Movie
export async function updateMovie(id, updatedProps) {
    beginRequest();

    const token = localStorage.getItem('userToken');

    const result = await (await fetch(host(endpoints.MOVIE_BY_ID + id), {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'user-token': token
        },
        body: JSON.stringify(updatedProps)
    })).json();

    endRequest();

    return result;
}
//delete movie
export async function deleteMovie(id) {
    beginRequest();

    const token = localStorage.getItem('userToken');

    const result = await (await fetch(host(endpoints.MOVIE_BY_ID + id), {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
            'user-token': token
        }
    })).json();

    endRequest();

    return result;
}
//get movies by userId
export async function getMoviesByOwner() {
    beginRequest();

    const token = localStorage.getItem('userToken');
    const ownerId = localStorage.getItem('userId');

    const result = (await fetch(host(endpoints.MOVIES + `?where=ownerId%3D%27${ownerId}%27`), {
        headers: {
            'user-token': token
        }
    })).json()

    endRequest();

    return result;
}

//buy ticket
export async function buyTicket(movie) {
    const newTickets = movie.tickets - 1;
    const movieId = movie.objectId;

    return updateMovie(movieId, { tickets: newTickets });
}