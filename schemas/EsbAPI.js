// @flow
import _ from 'lodash';
import elasticsearch from 'elasticsearch';
import esb from 'elastic-builder';
import casual from 'casual';

import mockServices from './MockServices';
import mockServiceRequests from './MockServiceRequests';
import mockCategories from './MockCategories';

const MOCK_TIMEOUT = 1000;

function isMockMode(): boolean {

  let mockToken = process.argv.find( (arg: string) => {
    return arg == "--mock"
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

  constructor(id: String,
              objectId: number,
              name: String,
              address: String,
              categoryId: number,
              soapAction: String,
              sla: number) {

    this.id = 'svc' + id;
    this.objectId = objectId;
    this.name = name;
    this.address = address;
    this.categoryId = categoryId;
    this.soapAction = soapAction;
    this.sla = sla;

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

    const elasticClient = props;
    const requestBody = esb.requestBodySearch()
    .query(
        esb.matchAllQuery()
    )

    elasticClient.search({
      index: 'esb_ppr_repository',
      body: requestBody.toJSON()
    }).then( response => {
      console.log(response);

      response.hits.hits.forEach( (bucket, index) => {

        const source = bucket._source;
        const category = new Category(casual.uuid,
                                      source.id,
                                      source.name);

        this.categories.push( category );

        source.service.forEach( (_service, index) => {

          const service = new Service(casual.uuid,
                                      _service.id,
                                      _service.name,
                                      _service.url,
                                      category.objectId,
                                      _service.soapAction,
                                      _service.sla);

          category.esbServices.push(service);
          this.services.push(service);
        })
      })

    });
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
