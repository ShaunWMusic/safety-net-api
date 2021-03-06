'use strict';

const User = use('App/Model/User');

const Hash = use('Hash');
const storeAttributes = ['email', 'password', 'password-confirmation'];
const updateAttributes = ['email', 'is-approved', 'is-admin'];

class UserController {

  get createRules() {
    return {
      email: 'required|email|unique:users',
      password: 'required',
    };
  }

  get createMessages() {
    return {
      'email.unique': 'That email has already been used by another account',
    };
  }

  * index(request, response) {
    if (request.input('current')) {
      return response.jsonApi('User', request.authUser);
    }
    const users = yield User.with('organization').fetch();

    response.jsonApi('User', users);
  }

  * store(request, response) {
    const input = request.jsonApi.getAttributesSnakeCase(storeAttributes);

    yield request.jsonApi.assertValid(input, this.createRules, this.createMessages);

    input.password = yield Hash.make(input.password);
    const foreignKeys = {
    };
    const user = yield User.create(Object.assign({}, input, foreignKeys));

    response.jsonApi('User', user);
  }

  * show(request, response) {
    const id = request.param('id');
    const user = yield User.with('organization').where({ id }).firstOrFail();

    response.jsonApi('User', user);
  }

  * update(request, response) {
    const id = request.param('id');
    request.jsonApi.assertId(id);

    const input = request.jsonApi.getAttributesSnakeCase(updateAttributes);
    const foreignKeys = {
    };

    const user = yield User.with('organization').where({ id }).firstOrFail();
    user.fill(Object.assign({}, input, foreignKeys));
    yield user.save();

    response.jsonApi('User', user);
  }

  * destroy(request, response) {
    const id = request.param('id');

    const user = yield User.query().where({ id }).firstOrFail();
    yield user.delete();

    response.status(204).send();
  }

}

module.exports = UserController;
