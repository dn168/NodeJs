const request = require('supertest');
const {Rental} = require('../../models/rental');
const {User} = require('../../models/user');
const mongoose = require('mongoose');

describe('/api/returns', () => {
    let server;
    let customerId;
    let movieId;
    let rental;
    let token;

    const exec = () => {
        return request(server)
        .post(`/api/returns`)
        .set('x-auth-token', token)
        .send({customerId, movieId});
    }
    
    beforeEach( async () => {
        server = require('../../index');
        token = new User().generateAuthToken();
        customerId = mongoose.Types.ObjectId();
        movieId = mongoose.Types.ObjectId();
        rental = new Rental({
            customer : {
                _id : customerId,
                name : '12345',
                phone: '12345'
            },
            movie : {
                _id : movieId,
                title : '12345',
                dailyRentalRate: 2,
            }
        });

        await rental.save();
    })
    afterEach(async ()=> {
        await Rental.deleteMany({});
        await server.close();
    })

    it('should return 401 if the client is not logged in', async () => {
        token = '';
        const res = await exec();

        expect(res.status).toBe(401);
    });

    it('should return 400 if the customerId is not provided', async () => {
        customerId = '';
        
        const res = await exec();
        
        expect(res.status).toBe(400);
    });

    it('should return 400 if the movieId is not provided', async () => {
        movieId = '';
        
        const res = await exec();
        
        expect(res.status).toBe(400);
    });

    it('should return 404 if no rental found for the customerId/movieId', async () => {
        await Rental.deleteMany({});

        const res = await exec();
        
        expect(res.status).toBe(404);
    });

    it('should return 400 if return is already processed', async () => {
        rental.dateReturned = new Date();
        await rental.save();

        const res = await exec();
        
        expect(res.status).toBe(400);
    });

    it('should return 200 if valid request', async () => {
        const res = await exec();

        const rentalInDb = await Rental.findById(rental._id);
        const diff = new Date() - rentalInDb.dateReturned;
        
        expect(diff).toBeLessThan(10*1000);
    });

});