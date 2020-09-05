
function optimizeUForDefEff(data){ //garbage optimization:
    var Us = [.1, 4]
    var test_U = [];
    while (true) {
        ux = Math.max(Us);
        um = Math.min(Us);
        if ((um-ux) < .000001 || (um-ux) > -.000001) {
            break
        }
        test_U = []
        var du = (ux-um)/5;
        for (let x = 0; x < 6; x++) {
            test_U.push(F_efficiency_as_a_function_of_u(data, (um+x*du))[0])
            // if F_efficiency_as_a_function_of_u(data, (um+(x+2)*du)) < if F_efficiency_as_a_function_of_u(data, (um+x*du))
            // break
        }
        place = find_place(Math.max(test_U), test_U) //place is the highest point
        Us = []
        Us.push(um + du*place)
        test_U[place] = -100000
        Us.push(um + du*find_place(Math.max(test_U), test_U)) // this is finding the second highest
    }   
    return (um)
}

function F_zT(T,R,S,K){
    return ((T*(S**2)/(K*R))/10**7)}
function F_max_Red_eff(zT){
    return ((Math.sqrt(1+zT)-1)/(Math.sqrt(1+zT)+1))}

function F_efficiency_as_a_function_of_u(file, initial_u){
    var notFile = [];
    notFile[0] = initial_u; // not file is so that the file is not changed it should be called something else some sort of efficiency
    for (let index = 0; index < file.length; index++) {
        notFile[index + 1] = (1/(((1/notFile[index])*Math.sqrt(abs(1-2*notFile[index]*notFile[index]*(file[index+1][1]*file[index+1][3]+file[index][1]*file[index][3])*(10**-5)/2*(file[index+1][0]-file[index][0]))))-(file[index+1][0]+file[index][0])/2*(file[index+1][2]-file[index][2])*(10**-6)))
    }
    var NL = file[-1][2]*file[-1][0]/1000000+1/notFile[-1]
    var N1 = file[0][2]*file[0][0]/1000000+1/notFile[0]
    return([(NL-N1)/NL,notFile])
}

function CalculateData(StaticData){
    var data = StaticData // Is this needed in java script?
    for (let rIndex = 0; rIndex < data.length; rIndex++) {
        const row = data[rIndex];
        data[rIndex][4] = functions_zT(row[0], row[1], row[2], row[3]); //zt
        data[rIndex][5] = functions_max_Red_eff(row[4]); // max reduced efficiency
        data[rIndex][6] = (Math.sqrt(1+row[4])-1)/(row[2]*row[0]/1000000); // Seebeck
        data[rIndex][7] = null; // something will be added
    }
    optimized_U = optimizeUForDefEff(data)[0]
    var EfficiencyU = F_efficiency_as_a_function_of_u(data, optimized_U)[1]
    for (let i = 0; i < data.length; i++) {
        data[i][7] = EfficiencyU[i];
    }
    for (let rIndex = 0; rIndex < data.length; rIndex++) {
        const datum = data[rIndex];
        redEfficiency = ((datum[7]*(datum[2]-datum[7]*datum[1]*datum[3]*10)/10**6)/(datum[7]*datum[2]/10**6+1/datum[0]));
        data[rIndex][8] = redEfficiency;
        Phi = (datum[2]*datum[0]/1000000+1/datum[7]);
        data[rIndex][9] = Phi;
    }
    for (let rIndex = 0; rIndex < data.length-1; rIndex++) {
        efficiency = ((data[rIndex+1][9]-data[0][9])/data[rIndex+1][9]);
        data[rIndex+1][10] = efficiency;
    }
    for (let rIndex = 0; rIndex < data.length-1; rIndex++) {
        ZT = (((data[rIndex+1][0]-data[0][0]*(1-data[rIndex+1][10]))/(data[rIndex+1][0]*(1-data[rIndex+1][10])-data[0][0]))**2-1)
        data[rIndex+1][11] = ZT;
    }
    return data
}