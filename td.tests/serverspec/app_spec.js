'use strict';


describe('app tests', function() {
    
    var mockery = require('mockery');
    var request = require('supertest');
    var finish_test = require('./helpers/supertest-jasmine');

    //bunyan mockery
    var mockLogger = {
        info: function() {},
        error: function() {}
    };

    var mockBunyan = {
        createLogger: function() { 
            return mockLogger;
        }
    };

    var mockExpressBunyan = function() {
        return function(res, req, next) {
            next();
        }
    };
    
    //skip session config and passport config here since it need LOADS of mocking
    var mockSessionConfig = function() { };
    var mockPassportConfig = function() { };
    
    beforeEach(function() {
        mockery.enable({ useCleanCache: true });
        mockery.warnOnUnregistered(false);
        mockery.warnOnReplace(false);
        mockery.registerMock('bunyan', mockBunyan);
        mockery.registerMock('express-bunyan-logger', mockExpressBunyan);
        mockery.registerMock('./config/session.config', mockSessionConfig);
        mockery.registerMock('./config/passport.config', mockPassportConfig);
    });
    
    afterEach(function() {
        mockery.disable();
    });
    
    it('should not throw', function() {
        expect(function() { require('../../td/app')}).not.toThrow();  
    });
    
    it('should log a startup message', function() {
        
        spyOn(mockBunyan, 'createLogger').and.callThrough();
        spyOn(mockLogger, 'info');
        spyOn(mockLogger, 'error');
        require('../../td/app');
        expect(mockBunyan.createLogger.calls.argsFor(0)[0].name).toEqual('threatdragon');
        expect(mockBunyan.createLogger.calls.argsFor(0)[0].level).toEqual('info');
        expect(mockLogger.info).toHaveBeenCalled();
        expect(mockLogger.error).not.toHaveBeenCalled();
    });
    
    it('should log an error on startup message', function() {
        
        spyOn(mockBunyan, 'createLogger').and.callThrough();
        spyOn(mockLogger, 'info').and.throwError('error');
        spyOn(mockLogger, 'error');
        require('../../td/app');
        expect(mockLogger.error.calls.argsFor(1)).toEqual(['error']);
    });
    
    it('should fetch the favicon',function(done) {
        
        var app = require('../../td/app');
        request(app)
        .get('/favicon.ico')
        .expect(200)
        .end(finish_test(done));
        
    });

    it('should render a pug template', function(done) {

        var app = require('../../td/app');
        var router = require('express').Router();
        router.get('/test', function(req, res) {
           res.render('test');
        });
        app.use('/', router);

        request(app)
        .get('/test')
        .expect(200)
        .end(finish_test(done));

    });
});



