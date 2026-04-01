import { WebSocketGateway, SubscribeMessage, MessageBody, OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit, WebSocketServer, ConnectedSocket } from '@nestjs/websockets';
import { UseGuards, Logger } from '@nestjs/common';
import { CreateEventDto } from './dto/create-event.dto';
import { Socket,Server } from 'socket.io';
import { Operation } from 'src/operation/entities/operation.entity';
import { WsBetterAuthGuard } from 'src/auth/ws-better-auth.guard';

const logger = new Logger('EventsGateway');

@WebSocketGateway({cors: true})
@UseGuards(WsBetterAuthGuard)
export class EventsGateway implements OnGatewayDisconnect,OnGatewayInit,OnGatewayConnection{
  @WebSocketServer()
  server: Server;
  private clientsMap: Map<string, Socket> = new Map();
  constructor() {}
  handleConnection(client: Socket, ...args: any[]) {
    logger.debug(client.id,' is connected!');
  }

  afterInit(server: any) {
    logger.debug('websocket successfuly initialized !');
  }



  handleDisconnect(client: Socket) {
    for (const [compteId, socket] of this.clientsMap.entries()) {
      if (socket === client) {
        this.clientsMap.delete(compteId);
        break;
      }
  }
}
 

  @SubscribeMessage('sign')
  create( @ConnectedSocket() client: Socket,@MessageBody() createEventDto: CreateEventDto) {
    const { compteId } = createEventDto;
    this.clientsMap.set(compteId, client);
    return { success: true };
  }

  envoyerMiseAJourCompte(compteId: string) {
    const client = this.clientsMap.get(compteId);
    if (client) {
      client.emit('update');
    }
  }

   envoyerCreationOperation(operation: Operation) {
      this.server.emit('operation_created', operation);
  }

  envoyerUpdateOperation(operation: Operation) {
      this.server.emit('operation_updated', operation);
  }

  envoyerDeleteOperation(operationId: string) {
      this.server.emit('operation_deleted', {_id: operationId});
  }

}
