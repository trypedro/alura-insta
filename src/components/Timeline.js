import React, { Component } from "react";
import FotoItem from './Foto';
import Pubsub from 'pubsub-js';
import { CSSTransitionGroup  } from 'react-transition-group'

export default class Timeline extends Component {

    constructor(props){
        super(props);

        this.state = { fotos: [] };

        this.login = this.props.login;
    }

    componentWillMount(){ 
        Pubsub.subscribe('timeline',(topico,fotos) => {
            this.setState({fotos : fotos.fotos});
          });

        Pubsub.subscribe('atualiza-liker', (topico, infoLiker) => {
            const fotoAchada = this.state.fotos.find( foto => foto.id === infoLiker.fotoId);
            fotoAchada.likeada = !fotoAchada.likeada;
            
            const possivelLiker = fotoAchada.likers.find(liker => liker.login === infoLiker.liker.login );
            
                if(possivelLiker === undefined) {
                    fotoAchada.likers.push(infoLiker.liker);
                    
                
                }else {
                    const novosLikers = fotoAchada.likers.filter(liker => liker.login !== infoLiker.liker.login);
                    fotoAchada.likers = novosLikers;

                }

            this.setState({ fotos: this.state.fotos });

        });

        Pubsub.subscribe('novos-comentarios', (topico, infoComentario) => {
            const fotoAchada = this.state.fotos.find( foto => foto.id === infoComentario.fotoId);
             
            fotoAchada.comentarios.push(infoComentario.novoComentario);
            this.setState({ fotos: this.state.fotos });
            
        
        });

    }


    carregarFotos(){
        let urlPerfil;
        
        if(this.login === undefined) {
            urlPerfil = `https://instalura-api.herokuapp.com/api/fotos?X-AUTH-TOKEN=${localStorage.getItem('auth-token')} `;

        }else {
            urlPerfil = `https://instalura-api.herokuapp.com/api/public/fotos/${this.login}`;

        }
        
        fetch(urlPerfil)
            .then(response => response.json())
            .then(fotos => {
               this.setState( {fotos: fotos} ) 
            });

    }

    componentDidMount() {
        this.carregarFotos();

    }


    componentWillReceiveProps(nextProps){
        if(nextProps.login !== undefined){
            this.login = nextProps.login;
            this.carregarFotos();

        }

    }

    like(fotoId){
        fetch(`https://instalura-api.herokuapp.com/api/fotos/${fotoId}/like?X-AUTH-TOKEN=${localStorage.getItem('auth-token')}`,
        {method: 'POST'})
        .then(response => {
            if(response.ok){
                return response.json();
            }else{
                throw new Error('Nao foi possivel realizar o like da foto.')

            }

        })
        .then(liker => {

            Pubsub.publish('atualiza-liker', { fotoId, liker })
        });
    }

    comenta(fotoId, textoComentario){
        const requestInfo = { method: 'POST',
            body: JSON.stringify({ texto: textoComentario }),
            headers: new Headers({
                'Content-Type': 'application/json'
            })
        };

        fetch(`https://instalura-api.herokuapp.com/api/fotos/${fotoId}/comment?X-AUTH-TOKEN=${localStorage.getItem('auth-token')}`,
        requestInfo)
            .then(response => {
                if(response.ok){
                    return response.json()

                }else{
                    throw new Error('Nao foi possivel comentar.')
                }
            })
            .then(novoComentario => {
                Pubsub.publish('novos-comentarios', { fotoId, novoComentario })
            });
    }

    render() {
        console.log(this.state.fotos)
        return (
            <div className="fotos container">

                <CSSTransitionGroup 
                transitionName="timeline"
                transitionEnterTimeout={500}
                transitionLeaveTimeout={300}>
                        {
                            this.state.fotos.map(foto => <FotoItem key={foto.id} foto={foto} 
                                like={this.like} comenta={this.comenta} />)
                        }

                </CSSTransitionGroup>

            </div>

        );
    }
}