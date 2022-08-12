import chai from 'chai';
import chaiHttp from 'chai-http';
import { expect } from 'chai';
import fs from 'fs';

/**
 * Verificar el Manual Tecnico, en el apartado:
 * 12. Validaciones 
 * 
 * 12.4. Validaciones del formato
 * 
 */
chai.use(chaiHttp);

const url = "http://localhost:3002";
//const url = "https://panel.facturasend.com.py";
//const token = 'eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJDSmVJOVN6VXJpSXlvRUxRajZaU2o3TGVqWThidHBqdjQ1S3FrT3NyYldrIn0.eyJleHAiOjE2MzYyODI0NDUsImlhdCI6MTYzNjI4MjE0NSwianRpIjoiNGYyZjEzYWMtODBlNi00ODQ0LWE2NDgtNzAwMGMxNTgzZTgyIiwiaXNzIjoiaHR0cDovL2xvY2FsaG9zdDo4MDgwL2F1dGgvcmVhbG1zL0ZhY3R1cmFjaW9uRWxlY3Ryb25pY2FSZWFsbSIsImF1ZCI6ImFjY291bnQiLCJzdWIiOiIwZDczNDgxZC1lYjI0LTRjOWItODMzMi1mY2ZhNDJjZmRiOGIiLCJ0eXAiOiJCZWFyZXIiLCJhenAiOiJmYWN0dXJhY2lvbi1lbGVjdHJvbmljYS1hcHAiLCJzZXNzaW9uX3N0YXRlIjoiOTEwYzVhNjktZWU1Yi00MjE1LWJiNDAtY2EwMzliNDE2OTJjIiwiYWNyIjoiMSIsImFsbG93ZWQtb3JpZ2lucyI6WyJodHRwOi8vbG9jYWxob3N0OjgwODAiXSwicmVhbG1fYWNjZXNzIjp7InJvbGVzIjpbImRlZmF1bHQtcm9sZXMtZmFjdHVyYWNpb25lbGVjdHJvbmljYXJlYWxtIiwib2ZmbGluZV9hY2Nlc3MiLCJ1bWFfYXV0aG9yaXphdGlvbiJdfSwicmVzb3VyY2VfYWNjZXNzIjp7ImFjY291bnQiOnsicm9sZXMiOlsibWFuYWdlLWFjY291bnQiLCJtYW5hZ2UtYWNjb3VudC1saW5rcyIsInZpZXctcHJvZmlsZSJdfX0sInNjb3BlIjoib2ZmbGluZV9hY2Nlc3MgcHJvZmlsZSBlbWFpbCIsInNpZCI6IjkxMGM1YTY5LWVlNWItNDIxNS1iYjQwLWNhMDM5YjQxNjkyYyIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJwcmVmZXJyZWRfdXNlcm5hbWUiOiJtYXJjb3NqYXJhIn0.NPq4Ul5Vxkt614HMYMcsCV8j9GrW5QW87TPJ2PXyo0ckHPx9D-SSx6sNFOzHLsTtgGhBIvb798iG0JnBqT72FRkTgatz42btwmOH9qX37W7H5sTHFhNGopfEzvvNJPi1aX6mA4sDjQS7UNFCjrOeCgJpaYCgxUUo33mD7b_oHGn5Xr68dIfpUR-_CQK4EaFlF-YC-Om6dBV4L2KTJcPF3PGAOnFwRB4RJbwp8OmLSAEGMoGLpr4ZupznuQYGy_-9sEbC6xQ641HVHL64pyE3fvAYji77hUG345IVfmWRrBmAZdj2TrLaJY98L1YxqYVgSKbDEiHdKfUYUyJor9cRQg';
const token = 'Bearer api_key_' + '9FFC28EB-5376-4392-B757-86E372FBB398';
//const url= environment.hom.url;

//teste
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
describe('Caso de Uso Documento Electronico: ',() => {
    
    let jsonName = 'factura_monalisa_tipo_operacion_2_4.json';
    let jsonFactura = JSON.parse(fs.readFileSync(`${__dirname}/${jsonName}`)+"");
    let tenantId = 'empresa0';

    it('Recibe DE', (done) => {
    chai.request(url)
        .post(`/api/${tenantId}/de/create?xml=true&qr=true`)
        .set('Authorization', token)
        .send(jsonFactura)
    .end( function(err, res){
        if (res.body.success == true) {
            console.debug(res.body.result.deList);
        } else {
            console.debug(res.body, err);
        }        
        expect(res).to.have.status(200);
        done();
        });
    });


/*    it('Create User', (done) => {
    chai.request(url)
        .get('/api/virgenparaguay/user/token')
        .send()
    .end( function(err, res){
        //console.debug(res.body);
        expect(res).to.have.status(200);
        done();
        });
    });
*/

});

   
