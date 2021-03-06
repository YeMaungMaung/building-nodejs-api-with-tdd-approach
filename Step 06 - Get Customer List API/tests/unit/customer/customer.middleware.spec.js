'use strict';

var chai = require('chai');
var expect = chai.expect;
var sinon = require('sinon');
var httpMocks = require('node-mocks-http');
var bluebird = require('bluebird');
var Promise = bluebird.Promise;

var CustomerModule = require('../../../modules/customer/customer.module')();
var CustomerMiddleware = CustomerModule.CustomerMiddleware;
var CustomerService = CustomerModule.CustomerService;

var Fixtures = require('../../fixtures/fixtures');
var CustomerFixture = Fixtures.CustomerFixture;
var ErrorFixture = Fixtures.ErrorFixture;

var req, res, next;

describe('CustomerMiddleware', function () {

    beforeEach(function () {
        req = httpMocks.createRequest();
        res = httpMocks.createResponse();
        next = sinon.spy();
    });

    describe('addCustomer', function () {
        var createCustomer, createCustomerPromise, expectedCreatedCustomer, expectedError;

        beforeEach(function () {
            createCustomer = sinon.stub(CustomerService, 'createCustomer');
            req.body = CustomerFixture.newCustomer;
        });

        afterEach(function () {
            createCustomer.restore();
        });

        it('should successfully create new customer', function () {
            expectedCreatedCustomer = CustomerFixture.createdCustomer;

            createCustomerPromise = Promise.resolve(expectedCreatedCustomer);
            createCustomer.withArgs(req.body).returns(createCustomerPromise);

            CustomerMiddleware.addCustomer(req, res, next);

            sinon.assert.callCount(createCustomer, 1);

            return createCustomerPromise.then(function () {
                expect(req.response).to.be.a('object');
                expect(req.response).to.deep.equal(expectedCreatedCustomer);
                sinon.assert.callCount(next, 1);
            });

        });

        it('should throw error while creating the new customer', function () {
            expectedError = ErrorFixture.unknownError;

            createCustomerPromise = Promise.reject(expectedError);
            createCustomer.withArgs(req.body).returns(createCustomerPromise);

            CustomerMiddleware.addCustomer(req, res, next);

            sinon.assert.callCount(createCustomer, 1);

            return createCustomerPromise.catch(function (error) {
                expect(error).to.be.a('object');
                expect(error).to.deep.equal(expectedError);
            });

        });

    });

    describe('getCustomers', function () {
        var fetchCustomers, fetchCustomersPromise, expectedCustomers, expectedError;

        beforeEach(function () {
            fetchCustomers = sinon.stub(CustomerService, 'fetchCustomers');
            req.body = {};
        });

        afterEach(function () {
            fetchCustomers.restore();
        });

        it('should successfully get all customers', function () {
            expectedCustomers = CustomerFixture.customers;

            fetchCustomersPromise = Promise.resolve(expectedCustomers);
            fetchCustomers.returns(fetchCustomersPromise);

            CustomerMiddleware.getCustomers(req, res, next);

            sinon.assert.callCount(fetchCustomers, 1);

            return fetchCustomersPromise.then(function () {
                expect(req.response).to.be.a('array');
                expect(req.response.length).to.equal(expectedCustomers.length);
                expect(req.response).to.deep.equal(expectedCustomers);
                sinon.assert.callCount(next, 1);
            });

        });

        it('should throw error while getting all customers', function () {
            expectedError = ErrorFixture.unknownError;

            fetchCustomersPromise = Promise.reject(expectedError);
            fetchCustomers.returns(fetchCustomersPromise);

            CustomerMiddleware.getCustomers(req, res, next);

            sinon.assert.callCount(fetchCustomers, 1);

            return fetchCustomersPromise.catch(function (error) {
                expect(error).to.be.a('object');
                expect(error).to.deep.equal(expectedError);
            });

        });

    });

});