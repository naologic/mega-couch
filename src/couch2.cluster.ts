import { MegaCouchServerConfig } from './couchdb.interface';
import { Couch2Server } from './couch2.server';



export class Couch2Cluster {
  private readonly configs: {
    mainServer: MegaCouchServerConfig;
    nodes: MegaCouchServerConfig[];
  };
  private readonly servers: {
    mainServer: Couch2Server;
    nodes: Couch2Server[];
  };

  constructor(
    mainServer: MegaCouchServerConfig,
    ...nodes: MegaCouchServerConfig[]
  ) {
    // -->Set: config
    this.configs = {mainServer, nodes};
    // todo-->Run: validation checks (using Joi)
  }

  /**
   * Init the cluster servers
   */
  public async init(): Promise<void> {
    // -->Create: main server
    this.servers.mainServer = new Couch2Server(this.configs.mainServer);
    // -->Create: nodes
    this.servers.nodes = this.configs.nodes.map(config => new Couch2Server(config));
  }

  public async info() {}
  public async check() {}
  public async create() {
    // -->Create: some dbs
    await this.servers.mainServer.dbCreate('_users');
    await this.servers.mainServer.dbCreate('_replicator');
    await this.servers.mainServer.dbCreate('_global_changes');

    // -->Associate: nodes
    for await (const node of this.servers.nodes) {
      // todo-->Check: that localPort is accessible
      // todo-->Set: server config for localPort
      // -->Save: to cluster
      // await node.
    }
  }
}