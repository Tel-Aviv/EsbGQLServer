// @flow
import _ from 'lodash';
import elasticsearch from 'elasticsearch';
import esb from 'elastic-builder';
import casual from 'casual';
import config from '../config';
import mockServices from './MockServices';
import mockServiceRequests from './MockServiceRequests';
import mockCategories from './MockCategories';

const MOCK_TIMEOUT = 1000;

function isMockMode(): boolean {

  let mockToken = process.argv.find( (arg: string) => {
    return arg === "--mock"
  });

  return mockToken;
}

class Service {

  id: String;
  objectId: number;
  name: String;
  address: String;
  categoryId: number;
  soapAction: String;
  sla: number;
  verb: String;

  constructor(id: String,
              objectId: number,
              name: String,
              address: String,
              categoryId: number,
              soapAction: String,
              sla: number,
              verb: String) {

    this.id = 'svc' + id;
    this.objectId = objectId;
    this.name = name;
    this.address = address;
    this.categoryId = categoryId;
    this.soapAction = soapAction;
    this.sla = sla;
    this.verb = verb;
  }
};

class Category {

  id: String;
  objectId: number;
  name: String;
  esbServices: Service[];

  constructor(id: String,
              objectId: number,
              name: String) {
    this.id = id;
    this.objectId = objectId;
    this.name = name;

    this.esbServices = [];
  }

  get services() {
    return this.esbServices;
  }
};

class Repository {

  categories: Category[];
  services: Service[];

  constructor(props) {

    this.categories = [];
    this.services = [];

    if( isMockMode() ) {

      console.log('Running in mock mode');

      this.services = mockServices;
      this.categories = mockCategories;

    } else {

        const elasticClient = props;
        const requestBody = esb.requestBodySearch()
        .query(
            esb.matchAllQuery()
        )

        elasticClient.search({
          index: config.categories_index_name,
          size: 100,
          body: requestBody.toJSON()
        }).then( response => {

          console.log('Categories count: ' + response.hits.total);

          response.hits.hits.forEach( (bucket, index) => {
            const source = bucket._source;
            const category = new Category(casual.uuid,
                                          source.id,
                                          source.name);
            this.categories.push( category );
            console.log('Category: ' + category.objectId);
          });

          elasticClient.search({
            index: config.services_index_name,
            size: 10000,
            body: requestBody.toJSON()
          }).then( resp => {

            console.log('Services count: ' + resp.hits.total);

            resp.hits.hits.forEach( (bucket, index) => {
              const _service = bucket._source;

              const service = new Service(casual.uuid,
                                          _service.service_id,
                                          _service.name,
                                          _service.url,
                                          _service.categoryId,
                                          _service.soap_action,
                                          _service.sla,
                                          _service.verb);
              this.services.push(service);
            });

        })

      });
    }
  }

  getServiceById(id: number): Service {

    return this.services.find( s => (
      s.objectId === id
    ));

  }

  deleteService(serviceId: number) : Service {
    const service = this.getServiceById(serviceId);
    if( !service ) {
      return null;
    }
    const index = this.services.indexOf(service);

    if( index > -1 ) {
      const deleted =  this.services.splice(index, 1);
      return deleted[0];
    } else {
      return null;
    }
  }

  static getAllServices() : Promise {

    return new Promise( (resolve, reject) => {

      setTimeout( () => {

        resolve(_.assign([], mockServices));

      }, MOCK_TIMEOUT);
    });

  }

  static getServicesCount() : number {
    return mockServices.length;
  }

  static getCategory(categoryId: number) : Promise {

    return new Promise( (resolve, reject) => {

        setTimeout( () => {

          let category = mockCategories.find(category => category.CategoryId == categoryId);
          resolve(category);

        }, MOCK_TIMEOUT);
    })

  }

  static getAllCategories(): Promise {

    return new Promise( (resolve, reject) => {

      setTimeout( () => {

        resolve(_.assign([], mockCategories));

      }, MOCK_TIMEOUT);
    })
  }

  static getService(objectId: number) : Service {
    // return new Service(casual.uuid,
    //                   objectId,
    //                   casual.title,
    //                   casual.url);
    let service = mockServices[objectId-1];
    return _.assign({}, service, {
                                  name: service.Name,
                                  Id: 'svc' + service.Id,
                                  address: service.Url,
                                  objectId: service.Id
                                 })  ;
  }

  static getServicesByCategoryId(categoryId: number) : Promise {

    return new Promise( (resolve, reject) => {

        setTimeout( () => {

           let categorizedServices = mockServices.filter( (service) => {
             return service.CategoryId == categoryId;
           });

           resolve(_.assign([], categorizedServices));

        }, MOCK_TIMEOUT);
    })
  }

  static getServiceRequests() : Promise {
    return new Promise( (resolve, reject) => {

      setTimeout( () => {

        resolve(_.assign([], mockServiceRequests));

      }, MOCK_TIMEOUT);
    });
  }
}


export default {
  Repository, Category, Service, isMockMode
};
